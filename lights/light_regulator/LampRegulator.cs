using System;
using System.Collections.Generic;
using System.Net.Sockets;
using System.Net;
using System.Threading.Tasks;
using System.Threading;
using TSHP;
using Microsoft.VisualBasic;
using System.IO;
using System.Security.Cryptography;

namespace light_regulator
{
    class LampRegulator
    {
        private List<SocketMemory> clientSockets = new List<SocketMemory>();
        private Socket serverSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
        private int backlog;
        private int port;
        private int id;
        private String randomSignature = "414140de5dae2223b00361a396177a9cb410ff61f20015ad"; //only for testing purpose 
        private int privateKeyLength = 0;
        private int publicKeyLength = 0;

        RSA myKeys = new RSACng(2048);
        RSA serverKey = new RSACng(2048);  
        int serverKeyLength; 


        public LampRegulator(int port, int backlog, int id)
        {
            this.backlog = backlog;
            this.port = port;
            this.id = id;

            serverSocket.Bind(new IPEndPoint(IPAddress.Any, port));
            serverSocket.Listen(this.backlog);

            try
            {
                using FileStream fs = File.OpenRead(port.ToString() + "Private.rsa");
                byte[] buff = new byte[2048];
                int c = fs.Read(buff, 0, buff.Length);
                myKeys.ImportPkcs8PrivateKey(buff, out privateKeyLength);

                using FileStream fs1 = File.OpenRead(port.ToString() + "Public.rsa");
                c = fs1.Read(buff, 0, buff.Length);
                //myKeys.ImportSubjectPublicKeyInfo(buff, out publicKeyLength);

            }
            catch (FileNotFoundException)
            {
                using FileStream fs = File.OpenWrite(port.ToString() + "Private.rsa");
                byte[] data = myKeys.ExportPkcs8PrivateKey();
                fs.Write(data, 0, data.Length);

                using FileStream fs1 = File.OpenWrite(port.ToString() + "Public.rsa");
                byte [] data1 = myKeys.ExportSubjectPublicKeyInfo();
                fs1.Write(data1, 0, data1.Length);
            }

            try
            {
                using FileStream fs = File.OpenRead("C:\\Users\\rafal\\source\\repos\\TIN\\server\\keys\\publicKey.rsa");
                byte[] buff = new byte[2048];
                int c = fs.Read(buff, 0, buff.Length);
                serverKey.ImportSubjectPublicKeyInfo(buff, out serverKeyLength); 
            }
            catch (FileNotFoundException)
            {
                Console.WriteLine("cant access regulator key"); 
            }


        }

        private SocketMemory FindById(int id)
        {
            SocketMemory ret;
            foreach (SocketMemory memory in clientSockets)
            {
                if (memory.port == id)
                {
                    ret = memory;
                    return ret;
                }
            }
            return null;
        }

        public void CloseRegulator()
        {
            foreach (SocketMemory memory in clientSockets)
            {
                memory.socket.Shutdown(SocketShutdown.Both);
                memory.socket.Close();
            }

        }

        public void StartRegulator()
        {

            Console.WriteLine("Searchnig for server");
            serverSocket.BeginAccept(new AsyncCallback(AcceptCallback), null);
            Console.Read();
        }

        private void AcceptCallback(IAsyncResult AR)
        {
            Console.WriteLine("new server message");
            Socket socket;
            try
            {
                socket = serverSocket.EndAccept(AR);
            }
            catch (ObjectDisposedException)
            {
                return;
            }

            SocketMemory memory = new SocketMemory(socket, new byte[1024], port);
            Task.Run(() => StartReceivingFromServer(memory));

            serverSocket.BeginAccept(new AsyncCallback(AcceptCallback), null);
        }

        private void StartReceivingFromServer(SocketMemory memory)
        {

            Socket socket = memory.socket;
            socket.ReceiveTimeout = 100;

            try
            {
                using (var resultStream = new MemoryStream())
                {
                    const int CHUNK_SIZE = 256;
                    byte[] buffer = new byte[CHUNK_SIZE];
                    int bytesReceived;
                    while (socket.Available > 0)
                    {
                        bytesReceived = socket.Receive(buffer, buffer.Length, SocketFlags.None);
                        byte[] actual = new byte[bytesReceived];
                        Buffer.BlockCopy(buffer, 0, actual, 0, bytesReceived);
                        resultStream.Write(actual, 0, actual.Length);
                    }
                    memory.messageBuffer = resultStream.ToArray();
                }
            }
            catch (SocketException)
            {
                Console.WriteLine("Lost connection to server");
                socket.Close();
                return;
            }

            ServerRegulator msg = new ServerRegulator(memory.messageBuffer, serverKey, myKeys);

            string text = msg.ToString();
            Console.WriteLine("received: " + text);
            Console.WriteLine("received settigns");
            msg.Settings.ForEach(Console.WriteLine);


            if (msg.operation.Equals("CHANGE_CONFIG"))
            {
                Task.Run(() => SearchForDevices(msg.Settings));
            }

            if (msg.operation.Equals("CURR_DATA"))
            {
                Console.WriteLine("wysylam odp");
                ServerRegulator response = new ServerRegulator(1, port, "CURR_DATA_RE", serverKey, myKeys);
                socket.Send(response.CurrDataRe(new List<CurrentData>())); 
                //Task.Run(() => GetAllStats());
                //ServerRegulator msg = new ServerRegulator(1, port, "Currdata_re")

            }

            if (msg.operation.Equals("CHANGE_PARAM"))
            {
                //Task.Run(() => ChangeParameter(parameter));
            }


        }



        private void SearchForDevices(List<DeviceSetting> list)
        {
            var ts = new CancellationTokenSource();
            CancellationToken ct = ts.Token;

            Task<int>[] tasks = new Task<int>[list.Count];

            for (int i = 0; i < list.Count; i++)
            {

                int port = ((ChangeConfig)list[i]).Port;
                tasks[i] = Task.Factory.StartNew(() =>
                {
                    Console.WriteLine("searching for device " + port);
                    Socket socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
                    int attempts = 0;
                    while (!socket.Connected)
                    {
                        try
                        {
                            attempts++;
                            socket.Connect(IPAddress.Loopback, port);
                        }
                        catch (SocketException)
                        {
                            //Console.WriteLine("conneciton attmpts with port " + port + ":" + attempts);
                            if (ct.IsCancellationRequested)
                            {
                                //Console.WriteLine("task canceled");
                                return 0;
                            }
                            Thread.Sleep(1000);
                        }
                    }

                    Console.WriteLine("found device " + port + ", starting pings");

                    SocketMemory memory = new SocketMemory(socket, new byte[256], port);
                    clientSockets.Add(memory);
                    //StartPinging(memory);
                    return port;
                }, ct);
            }
            Thread.Sleep(5000);

            ts.Cancel();

            for (int i = 0; i < tasks.Length; i++)
            {
                if (tasks[i].Result == 0)
                {
                    Console.WriteLine("cannot conect to port " + ((ChangeConfig)list[i]).Port);
                }
                else
                {
                    Console.WriteLine("connected to port " + ((ChangeConfig)list[i]).Port);
                }
            }
        }

        //public void GetAllStats()
        //{
        //    var ts = new CancellationTokenSource();
        //    CancellationToken ct = ts.Token;

        //    Task<int>[] tasks = new Task<int>[clientSockets.Count];
        //    for (int i = 0; i < clientSockets.Count; i++)
        //    {
        //        SocketMemory memory = clientSockets[i];
        //        tasks[i] = Task.Factory.StartNew(() =>
        //        {
        //            RegulatorDevice msg = new RegulatorDevice(1, 1, "STATUS", randomSignature);
        //            memory.socket.Send(msg.ToBytes());

        //            memory.socket.Receive(memory.messageBuffer);
        //            msg = new RegulatorDevice(memory.messageBuffer);



        //            if (ct.IsCancellationRequested)
        //            {
        //                //Console.WriteLine("task canceled");
        //                return 0;
        //            }
        //            return int.Parse(msg.Data);
        //        }, ct);

        //    }

        //    Thread.Sleep(5000);

        //    ts.Cancel();
        //}

        //private int ChangeParameter(int id, int parameter)
        //{
        //    var ts = new CancellationTokenSource();
        //    CancellationToken ct = ts.Token;

        //    String newParameter = parameter == 1 ? "SET1" : "SET0";

        //    SocketMemory memory = FindById(id);
        //    if (memory == null)
        //    {
        //        return 1;
        //    }

        //    Task<int> task = Task.Factory.StartNew(() =>
        //    {
        //        RegulatorDevice msg = new RegulatorDevice(1, 1, newParameter, randomSignature);
        //        memory.socket.Send(msg.ToBytes());

        //        memory.socket.Receive(memory.messageBuffer);
        //        msg = new RegulatorDevice(memory.messageBuffer);

        //        if (ct.IsCancellationRequested)
        //        {
        //            //Console.WriteLine("task canceled");
        //            return 2;
        //        }

        //        return 0;
        //    }, ct);

        //    Thread.Sleep(1000);
        //    ts.Cancel();

        //    return task.Result;


        //}

        //private void StartPinging(SocketMemory memory)
        //{
        //    RegulatorDevice msg = new RegulatorDevice(1, id, "PING", randomSignature, serverKey, myKeys);
        //    //RegulatorDevice.Encrypt()
        //    Array.Copy(msg.encryptedData, memory.pingBuffer, msg.encryptedData.Length);
        //    try
        //    {
        //        memory.socket.BeginSend(memory.pingBuffer, 0, memory.pingBuffer.Length, SocketFlags.None, new AsyncCallback(SendPing), memory);
        //    }
        //    catch (SocketException)
        //    {
        //        //device disconnected
        //        Console.WriteLine("Device " + memory.port + " disconnected");
        //    }

        //}
        //private void SendPing(IAsyncResult AR)
        //{
        //    SocketMemory memory = (SocketMemory)AR.AsyncState;
        //    Socket socket = memory.socket;
        //    socket.EndSend(AR);
        //    socket.BeginReceive(memory.pingBuffer, 0, memory.pingBuffer.Length, SocketFlags.None, ReceivePing, memory);
        //}
        //private void ReceivePing(IAsyncResult AR)
        //{
        //    Console.WriteLine("started ping rec");
        //    SocketMemory memory = (SocketMemory)AR.AsyncState;
        //    Socket socket = memory.socket;

        //    int received;

        //    try
        //    {
        //        received = socket.EndReceive(AR);
        //    }
        //    catch (SocketException)
        //    {
        //        Console.WriteLine("client forcefully disconnected");
        //        socket.Close();
        //        clientSockets.Remove(memory);
        //        return;
        //    }

        //    RegulatorDevice msg = new RegulatorDevice(memory.pingBuffer, serverKey, myKeys);
        //    string text = msg.ToString();
        //    Console.WriteLine("received: " + text);

        //    Thread.Sleep(5000);

        //    //todo catch client disconnected exception 
        //    StartPinging(memory);
        //}

        //private void CustomMessege()
        //{
        //    int lampId = 1;
        //    string operation;

        //    while (lampId != 0)
        //    {
        //        lampId = Int32.Parse(Console.ReadLine()); //todo handle exception
        //        operation = Console.ReadLine();
        //        SocketMemory selected = null;
        //        foreach (SocketMemory memory in clientSockets)
        //        {
        //            if (memory.port == lampId)
        //            {
        //                selected = memory;
        //                break;
        //            }
        //        }

        //        StartCustom(selected, operation);
        //    }
        //}

        //private void StartCustom(SocketMemory memory, string operation)
        //{
        //    RegulatorDevice msg = new RegulatorDevice(1, id, operation, randomSignature);
        //    Array.Copy(msg.ToBytes(), memory.pingBuffer, msg.Size); //todo delete parralel access to memory
        //    memory.socket.BeginSend(memory.pingBuffer, 0, memory.pingBuffer.Length, SocketFlags.None, new AsyncCallback(SendCustom), memory);//todo merge with startping

        //}

        //private void SendCustom(IAsyncResult AR)
        //{
        //    SocketMemory memory = (SocketMemory)AR.AsyncState;
        //    Socket socket = memory.socket;
        //    socket.EndSend(AR);
        //    socket.BeginReceive(memory.pingBuffer, 0, memory.pingBuffer.Length, SocketFlags.None, ReceiveCustom, memory);
        //}

        //private void ReceiveCustom(IAsyncResult AR)
        //{
        //    SocketMemory memory = (SocketMemory)AR.AsyncState;
        //    Socket socket = memory.socket;

        //    int received;

        //    try
        //    {
        //        received = socket.EndReceive(AR);
        //    }
        //    catch (SocketException)
        //    {
        //        Console.WriteLine("client forcefully disconnected");
        //        socket.Close();
        //        clientSockets.Remove(memory);
        //        return;
        //    }


        //    RegulatorDevice msg = new RegulatorDevice(memory.pingBuffer);

        //    string text = msg.ToString();
        //    Console.WriteLine("received: " + text);
        //}

        private class SocketMemory
        {
            public Socket socket;
            public byte[] pingBuffer;
            public byte[] messageBuffer;
            public RSACryptoServiceProvider publicKey;
            public int port;
            public SocketMemory(Socket socket, byte[] pingBuffer, int port)
            {
                this.socket = socket;
                this.pingBuffer = pingBuffer;
                this.port = port;
            }
        }

    }
}
