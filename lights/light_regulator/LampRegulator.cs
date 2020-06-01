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
        private int privateKeyLength = 0;

        RSACng myKeys = new RSACng(2048);
        RSACng serverKey = new RSACng(2048);
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

            }
            catch (FileNotFoundException)
            {
                using FileStream fs = File.OpenWrite(port.ToString() + "Private.rsa");
                byte[] data = myKeys.ExportPkcs8PrivateKey();
                fs.Write(data, 0, data.Length);

                using FileStream fs1 = File.OpenWrite(port.ToString() + "Public.rsa");
                byte[] data1 = myKeys.ExportSubjectPublicKeyInfo();
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
                utils.Log("cant access server key", -1);
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

            utils.Log("Searchnig for server", 0);
            serverSocket.BeginAccept(new AsyncCallback(AcceptCallback), null);

            //to delete
            //List<DeviceSetting> devices = new List<DeviceSetting>();
            //devices.Add(new ChangeConfig(1, 60000, 1));
            //SearchForDevices(devices);



            Console.Read();
        }

        private void AcceptCallback(IAsyncResult AR)
        {
            utils.Log("new server message", 1);
            Socket socket;
            try
            {
                socket = serverSocket.EndAccept(AR);
            }
            catch (ObjectDisposedException)
            {
                return;
            }

            SocketMemory memory = new SocketMemory(socket, new byte[1024], port, serverKey);
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
                utils.Log("Lost connection to server", -1);
                socket.Close();
                return;
            }

            ServerRegulator msg = new ServerRegulator(memory.messageBuffer, memory.publicKey, myKeys);

            string text = msg.ToString();
            utils.Log("received: " + text, 0);
            utils.Log("received settigns", 0);
            msg.Settings.ForEach(Console.WriteLine);


            if (msg.operation.Equals("CHANGE_CONFIG"))
            {
                Task.Run(() => SearchForDevices(msg.Settings));
                ServerRegulator response = new ServerRegulator(1, port, "CHANGE_DATA_RE", memory.publicKey, myKeys);
                socket.Send(response.ChangeConfigRe());
            }

            if (msg.operation.Equals("CURR_DATA"))
            {
                Task<List<CurrentData>> t = Task.Run(() => GetAllStats());
                ServerRegulator response = new ServerRegulator(1, port, "CURR_DATA_RE", memory.publicKey, myKeys);
                socket.Send(response.CurrDataRe(t.Result));

            }

            if (msg.operation.Equals("CHANGE_PARAMS"))
            {
                Task<int> t = Task.Run(() => ChangeParameter(msg.Id, msg.target));
                ServerRegulator response = new ServerRegulator(1, port, "CHANGE_PARAMS_RE", memory.publicKey, myKeys);
                socket.Send(response.ChangeParamsRe((short)t.Result));
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
                byte[] key = ((ChangeConfig)list[i]).Key;
                tasks[i] = Task.Factory.StartNew(() =>
                {
                    utils.Log("searching for device " + port, 0);
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

                    utils.Log("found device " + port, 1);

                    RSACng publicKey = new RSACng(2048);
                    publicKey.ImportSubjectPublicKeyInfo(key, out _);
                    SocketMemory memory = new SocketMemory(socket, new byte[256], port, publicKey);
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
                    utils.Log("cannot conect to port " + ((ChangeConfig)list[i]).Port, -1);
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Green;
                    utils.Log("connected to port " + ((ChangeConfig)list[i]).Port, 1);
                }
            }
        }

        public List<CurrentData> GetAllStats()
        {
            List<CurrentData> statuses = new List<CurrentData>();
            var ts = new CancellationTokenSource();
            CancellationToken ct = ts.Token;

            Task<bool>[] tasks = new Task<bool>[clientSockets.Count];
            for (int i = 0; i < clientSockets.Count; i++)
            {
                SocketMemory memory = clientSockets[i];

                tasks[i] = Task.Factory.StartNew(() =>
                {
                    RegulatorDevice msg = new RegulatorDevice(1, port, "GETSTATUS", memory.publicKey, myKeys);
                    memory.messageBuffer = msg.ToBytes();
                    memory.socket.Send(memory.messageBuffer);

                    memory.socket.Receive(memory.messageBuffer);
                    msg = new RegulatorDevice(memory.messageBuffer, memory.publicKey, myKeys);
                    string text = msg.ToString();
                    utils.Log(text, 1);



                    //if (ct.IsCancellationRequested)
                    //{
                    //    //Console.WriteLine("task canceled");
                    //    statuses.Add(new CurrentData(msg.Id, 2));
                    //    return false;
                    //}
                    utils.Log($"returned status : {bool.Parse(msg.operation)}", 1);
                    short currStatus = bool.Parse(msg.operation) == true ? (short)1 : (short)0;
                    statuses.Add(new CurrentData(msg.Id, currStatus));
                    return bool.Parse(msg.operation);
                }, ct);


            }

            Thread.Sleep(1000);
            statuses.ForEach(Console.WriteLine);

            ts.Dispose(); 
            //ts.Cancel();
            return statuses;
        }

        private int ChangeParameter(int id, short parameter)
        {
            var ts = new CancellationTokenSource();
            CancellationToken ct = ts.Token;

            String newParameter = parameter == 1? "SET1" : "SET0";

            SocketMemory memory = FindById(id);
            if (memory == null)
            {
                return 1;
            }

            Task<int> task = Task.Factory.StartNew(() =>
            {
                RegulatorDevice msg = new RegulatorDevice(1, 1, newParameter, memory.publicKey, myKeys);
                memory.socket.Send(msg.ToBytes());

                memory.socket.Receive(memory.messageBuffer);
                msg = new RegulatorDevice(memory.messageBuffer, memory.publicKey, myKeys);

                //if (ct.IsCancellationRequested)
                //{
                //    //Console.WriteLine("task canceled");
                //    return 2;
                //}

                return 0;
            }, ct);

            Thread.Sleep(1000);
            int result = task.IsCompleted ? task.Result : 2; 
            task.Dispose();
            //ts.Cancel();

            return result;

        }

        private void StartPinging(SocketMemory memory)
        {
            RegulatorDevice msg = new RegulatorDevice(1, id, "PING", memory.publicKey, myKeys);
            memory.pingBuffer = msg.ToBytes();
            try
            {
                memory.socket.BeginSend(memory.pingBuffer, 0, memory.pingBuffer.Length, SocketFlags.None, new AsyncCallback(SendPing), memory);
            }
            catch (SocketException)
            {
                //device disconnected
                utils.Log("Device " + memory.port + " disconnected", -1);
            }

        }
        private void SendPing(IAsyncResult AR)
        {
            SocketMemory memory = (SocketMemory)AR.AsyncState;
            Socket socket = memory.socket;
            socket.EndSend(AR);
            socket.BeginReceive(memory.pingBuffer, 0, memory.pingBuffer.Length, SocketFlags.None, ReceivePing, memory);
        }
        private void ReceivePing(IAsyncResult AR)
        {
            SocketMemory memory = (SocketMemory)AR.AsyncState;
            Socket socket = memory.socket;

            int received;

            try
            {
                received = socket.EndReceive(AR);
            }
            catch (SocketException)
            {
                utils.Log("client forcefully disconnected", -1);
                socket.Close();
                clientSockets.Remove(memory);
                return;
            }

            RegulatorDevice msg = new RegulatorDevice(memory.pingBuffer, memory.publicKey, myKeys);
            string text = msg.ToString();
            utils.Log("received: " + text, 0);

            Thread.Sleep(5000);

            //todo catch client disconnected exception 
            StartPinging(memory);
        }

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
            public RSACng publicKey;
            public int port;
            public SocketMemory(Socket socket, byte[] pingBuffer, int port, RSACng publicKey)
            {
                this.socket = socket;
                this.pingBuffer = pingBuffer;
                this.port = port;
                this.publicKey = publicKey;
            }

        }

    }
}
