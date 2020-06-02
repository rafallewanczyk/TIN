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
                Utils.Log("cant access server key", -1);
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

        public void DeleteAllDevices()
        {
            foreach (SocketMemory memory in clientSockets)
            {
                //memory.socket.Shutdown(SocketShutdown.Both);
                memory.socket.Close();
            }
            clientSockets.Clear();

        }

        public void StartRegulator()
        {

            Utils.Log("Searchnig for server", 0);
            serverSocket.BeginAccept(new AsyncCallback(AcceptCallback), null);

            Console.Read();
        }

        private void AcceptCallback(IAsyncResult AR)
        {
            Utils.Log("new server message", 1);
            Socket socket;
            try
            {
                socket = serverSocket.EndAccept(AR);
            }
            catch (ObjectDisposedException)
            {
                return;
            }

            SocketMemory memory = new SocketMemory(socket, port, serverKey);
            Task.Run(() => StartReceivingFromServer(memory));

            serverSocket.BeginAccept(new AsyncCallback(AcceptCallback), null);
        }

        private void StartReceivingFromServer(SocketMemory memory)
        {

            Socket socket = memory.socket;
            socket.ReceiveTimeout = 100;

            try
            {
                memory.messageBuffer = Utils.ReadFromSocket(socket); 
            }
            catch (SocketException)
            {
                Utils.Log("Lost connection to server", -1);
                socket.Close();
                return;
            }

            ServerRegulator msg = new ServerRegulator(memory.messageBuffer, memory.publicKey, myKeys);

            string text = msg.ToString();
            Utils.Log("received: " + text, 0);
            Utils.Log("received settigns", 0);
            msg.Settings.ForEach(Console.WriteLine);


            if (msg.operation.Equals("CHANGE_CONFIG"))
            {
                SearchForDevices(msg.Settings);
                ServerRegulator response = new ServerRegulator(1, port, "CHANGE_DATA_RE", memory.publicKey, myKeys);
                socket.Send(response.ChangeConfigRe());
            }

            if (msg.operation.Equals("CURR_DATA"))
            {
                List<CurrentData> statuses = GetAllStats();
                ServerRegulator response = new ServerRegulator(1, port, "CURR_DATA_RE", memory.publicKey, myKeys);
                socket.Send(response.CurrDataRe(statuses));

            }

            if (msg.operation.Equals("CHANGE_PARAMS"))
            {
                int result = ChangeParameter(msg.Id, msg.target);
                ServerRegulator response = new ServerRegulator(1, port, "CHANGE_PARAMS_RE", memory.publicKey, myKeys);
                socket.Send(response.ChangeParamsRe((short)result));
            }


        }



        private void SearchForDevices(List<DeviceSetting> list)
        {
            //DeleteAllDevices();
            var ts = new CancellationTokenSource();
            CancellationToken ct = ts.Token;

            Task[] tasks = new Task[list.Count];
            int[] results = new int[list.Count];

            for (int i = 0; i < list.Count; i++)
            {

                int port = ((ChangeConfig)list[i]).Port;
                byte[] key = ((ChangeConfig)list[i]).Key;
                int index = i;
                tasks[i] = Task.Factory.StartNew(() =>
                {
                    Utils.Log("searching for device " + port, 0);
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
                            results[index] = 0;
                            Thread.Sleep(1000);
                        }
                    }

                    Utils.Log("found device " + port, 1);

                    RSA publicKey = new RSACng(2048);
                    publicKey.ImportSubjectPublicKeyInfo(key, out _);
                    SocketMemory memory = new SocketMemory(socket, port, publicKey);
                    clientSockets.Add(memory);
                    results[index] = port;
                }, ct);
            }
            Thread.Sleep(2000);

            ts.Cancel();

            for (int i = 0; i < tasks.Length; i++)
            {
                if (results[i] == 0)
                {
                    Utils.Log("cannot conect to port " + ((ChangeConfig)list[i]).Port, -1);
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Green;
                    Utils.Log("connected to port " + ((ChangeConfig)list[i]).Port, 1);
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

                    //memory.messageBuffer = Utils.ReadFromSocket(memory.socket); 
                    //socket disconnected exception 
                    memory.socket.Receive(memory.messageBuffer); 
                    msg = new RegulatorDevice(memory.messageBuffer, memory.publicKey, myKeys);
                    string text = msg.ToString();
                    Utils.Log(text, 1);



                    if (ct.IsCancellationRequested)
                    {
                        //Console.WriteLine("task canceled");
                        statuses.Add(new CurrentData(msg.Id, 2));
                        return false;
                    }
                    Utils.Log($"returned status : {bool.Parse(msg.operation)}", 1);
                    short currStatus = bool.Parse(msg.operation) == true ? (short)1 : (short)0;
                    statuses.Add(new CurrentData(msg.Id, currStatus));
                    return bool.Parse(msg.operation);
                }, ct);


            }

            Thread.Sleep(1000);
            statuses.ForEach(Console.WriteLine);

            //ts.Cancel();
            return statuses;
        }

        private int ChangeParameter(int id, short parameter)
        {
            var ts = new CancellationTokenSource();
            CancellationToken ct = ts.Token;

            String newParameter = parameter == 1 ? "SET1" : "SET0";

            SocketMemory memory = FindById(id);
            if (memory == null)
            {
                return 1;
            }

            Task<int> task = Task.Factory.StartNew(() =>
            {
                RegulatorDevice msg = new RegulatorDevice(1, 1, newParameter, memory.publicKey, myKeys);
                memory.socket.Send(msg.ToBytes());

                //memory.messageBuffer = Utils.ReadFromSocket(memory.socket);
                memory.socket.Receive(memory.messageBuffer); 
                msg = new RegulatorDevice(memory.messageBuffer, memory.publicKey, myKeys);

                if (ct.IsCancellationRequested)
                {
                    //Console.WriteLine("task canceled");
                    return 2;
                }

                return 0;
            }, ct);

            Thread.Sleep(1000);
            int result = task.IsCompleted ? task.Result : 2;

            ts.Cancel();

            return result;

        }
        private class SocketMemory
        {
            public Socket socket;
            public byte[] messageBuffer;
            public RSA publicKey;
            public int port;
            public SocketMemory(Socket socket, int port, RSA publicKey)
            {
                this.socket = socket;
                this.port = port;
                this.publicKey = publicKey;
            }

        }

    }
}
