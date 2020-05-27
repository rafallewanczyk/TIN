using System;
using System.Collections.Generic;
using System.Net.Sockets;
using System.Net;
using System.Threading.Tasks;
using System.Threading;
using TSHP;
using Microsoft.VisualBasic;

namespace light_regulator
{
    class LampRegulator
    {
        private byte[] _buffer = new byte[1024];
        private List<SocketMemory> clientSockets = new List<SocketMemory>();
        private Socket serverSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
        private Socket listener = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
        private int backlog;
        private int port;
        private int id;
        private int connected_clients = 0;
        private String randomSignature = "414140de5dae2223b00361a396177a9cb410ff61f20015ad"; //only for testing purpose 


        public LampRegulator(int port, int backlog, int id)
        {
            this.backlog = backlog;
            this.port = port;
            this.id = id;
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

            SearchForServer(4000);
            Console.Read();


            //TryToConnect(60000);
            //TryToConnect(port + 1);

            //CustomMessege();
        }

        //private void AcceptCallback(IAsyncResult AR)
        //{
        //    Socket socket;
        //    try
        //    {
        //        socket = _serverSocket.EndAccept(AR);
        //    }
        //    catch (ObjectDisposedException)
        //    {
        //        return;
        //    }

        //    Console.WriteLine("client connected");


        //    SocketMemory memory = new SocketMemory(socket, new byte[1024], ++connected_clients);
        //    clientSockets.Add(memory);


        //    StartPinging(memory);
        //    _serverSocket.BeginAccept(new AsyncCallback(AcceptCallback), null);
        //}

        private void SearchForServer(int port)
        {
            Console.WriteLine("searching for server");
            serverSocket.Bind(new IPEndPoint(IPAddress.Any, port));
            serverSocket.Listen(1); //todo put backlog in variable
            listener = serverSocket.Accept();

            Console.WriteLine("found server");

            SocketMemory memory = new SocketMemory(listener, new byte[1024], port);
            memory.socket.BeginReceive(memory.pingBuffer, 0, memory.pingBuffer.Length, SocketFlags.None, new AsyncCallback(StartReceivingFromServer), memory);
        }

        private void StartReceivingFromServer(IAsyncResult AR)
        {

            Console.WriteLine("Waiting for server data");
            SocketMemory memory = (SocketMemory)AR.AsyncState;
            Socket socket = memory.socket;

            int received;

            try
            {
                received = socket.EndReceive(AR);
            }
            catch (SocketException)
            {
                Console.WriteLine("client forcefully disconnected");
                socket.Close();
                clientSockets.Remove(memory);
                return;
            }

            ServerRegulator msg = new ServerRegulator(memory.pingBuffer);

            string text = msg.ToString();
            Console.WriteLine("received: " + text);
            Console.WriteLine("received settigns");
            msg.Settings.ForEach(Console.WriteLine);

            socket.BeginReceive(memory.pingBuffer, 0, memory.pingBuffer.Length, SocketFlags.None, new AsyncCallback(StartReceivingFromServer), memory);

            if (msg.Data.Equals("CHANGE_CONFIG"))
            {
                Task.Run(() => SearchForDevices(msg.Settings));
            }

            if (msg.Data.Equals("CURR_DATA"))
            {
                Task.Run(() => GetAllStats());
            }

            if (msg.Data.Equals("CHANGE_PARAM"))
            {
                //Task.Run(() => ChangeParameter(parameter));
            }
            //SearchForServer(4000);
            //socket.BeginReceive(memory.buffer, 0, memory.buffer.Length, SocketFlags.None, new AsyncCallback(StartReceivingFromServer), memory);
            //StartCustom(memory, "OK");
            //todo catch client disconnected exception 
            //todo forward messege to device
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

                    SocketMemory memory = new SocketMemory(socket, new byte[1024], port);
                    clientSockets.Add(memory);
                    StartPinging(memory);
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

        public void GetAllStats()
        {
            var ts = new CancellationTokenSource();
            CancellationToken ct = ts.Token;

            Task<int>[] tasks = new Task<int>[clientSockets.Count];
            for (int i = 0; i < clientSockets.Count; i++)
            {
                SocketMemory memory = clientSockets[i];
                tasks[i] = Task.Factory.StartNew(() =>
                {
                    RegulatorDevice msg = new RegulatorDevice(1, 1, "STATUS", randomSignature);
                    memory.socket.Send(msg.ToBytes());

                    memory.socket.Receive(memory.messageBuffer);
                    msg = new RegulatorDevice(memory.messageBuffer);



                    if (ct.IsCancellationRequested)
                    {
                        //Console.WriteLine("task canceled");
                        return 0;
                    }
                    return int.Parse(msg.Data);
                }, ct);

            }

            Thread.Sleep(5000);

            ts.Cancel();
        }

        private int ChangeParameter(int id, int parameter)
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
                RegulatorDevice msg = new RegulatorDevice(1, 1, newParameter, randomSignature);
                memory.socket.Send(msg.ToBytes());

                memory.socket.Receive(memory.messageBuffer);
                msg = new RegulatorDevice(memory.messageBuffer);

                if (ct.IsCancellationRequested)
                {
                    //Console.WriteLine("task canceled");
                    return 2;
                }

                return 0;
            }, ct);

            Thread.Sleep(1000);
            ts.Cancel();

            return task.Result;


        }

        private void StartPinging(SocketMemory memory)
        {
            RegulatorDevice msg = new RegulatorDevice(1, id, "PING", randomSignature);
            Array.Copy(msg.ToBytes(), memory.pingBuffer, msg.Size);
            try
            {

                memory.socket.BeginSend(memory.pingBuffer, 0, memory.pingBuffer.Length, SocketFlags.None, new AsyncCallback(SendPing), memory);
            }
            catch (SocketException)
            {
                //device disconnected
                Console.WriteLine("Device " + memory.port + " disconnected");
            }

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
                Console.WriteLine("client forcefully disconnected");
                socket.Close();
                clientSockets.Remove(memory);
                return;
            }

            RegulatorDevice msg = new RegulatorDevice(memory.pingBuffer);
            string text = msg.ToString();
            Console.WriteLine("received: " + text);

            Thread.Sleep(5000);

            //todo catch client disconnected exception 
            StartPinging(memory);
        }

        private void SendPing(IAsyncResult AR)
        {
            SocketMemory memory = (SocketMemory)AR.AsyncState;
            Socket socket = memory.socket;
            socket.EndSend(AR);
            socket.BeginReceive(memory.pingBuffer, 0, memory.pingBuffer.Length, SocketFlags.None, ReceivePing, memory);
        }

        private void CustomMessege()
        {
            int lampId = 1;
            string operation;

            while (lampId != 0)
            {
                lampId = Int32.Parse(Console.ReadLine()); //todo handle exception
                operation = Console.ReadLine();
                SocketMemory selected = null;
                foreach (SocketMemory memory in clientSockets)
                {
                    if (memory.port == lampId)
                    {
                        selected = memory;
                        break;
                    }
                }

                StartCustom(selected, operation);
            }
        }

        private void StartCustom(SocketMemory memory, string operation)
        {
            RegulatorDevice msg = new RegulatorDevice(1, id, operation, randomSignature);
            Array.Copy(msg.ToBytes(), memory.pingBuffer, msg.Size); //todo delete parralel access to memory
            memory.socket.BeginSend(memory.pingBuffer, 0, memory.pingBuffer.Length, SocketFlags.None, new AsyncCallback(SendCustom), memory);//todo merge with startping

        }

        private void SendCustom(IAsyncResult AR)
        {
            SocketMemory memory = (SocketMemory)AR.AsyncState;
            Socket socket = memory.socket;
            socket.EndSend(AR);
            socket.BeginReceive(memory.pingBuffer, 0, memory.pingBuffer.Length, SocketFlags.None, ReceiveCustom, memory);
        }

        private void ReceiveCustom(IAsyncResult AR)
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
                Console.WriteLine("client forcefully disconnected");
                socket.Close();
                clientSockets.Remove(memory);
                return;
            }


            RegulatorDevice msg = new RegulatorDevice(memory.pingBuffer);

            string text = msg.ToString();
            Console.WriteLine("received: " + text);
        }

        private class SocketMemory
        {
            public Socket socket;
            public byte[] pingBuffer;
            public byte[] messageBuffer;
            public int port;
            public SocketMemory(Socket socket, byte[] pingBuffer, int port)
            {
                this.socket = socket;
                this.pingBuffer = pingBuffer;
                this.port = port;
                this.messageBuffer = new byte[1024];
            }
        }

    }
}
