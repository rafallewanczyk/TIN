using System;
using System.Collections.Generic;
using System.Text;
using System.Net.Sockets;
using System.Net;
using System.Threading.Tasks;
using System.Threading;
using System.Reflection.Metadata;
using System.ComponentModel;
using TSHP;

namespace light_regulator
{
    class LampRegulator
    {
        private byte[] _buffer = new byte[1024];
        private List<SocketMemory> clientSockets = new List<SocketMemory>();
        private Socket _serverSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
        private int backlog;
        private int port;
        private int id;
        private int connected_clients = 0;
        private String randomSignature = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"; //only for testing purpose 


        public LampRegulator(int port, int backlog, int id)
        {
            this.backlog = backlog;
            this.port = port;
            this.id = id;
        }

        public async Task StartRegulatorAsync()
        {
            await SetupServerAsync();
        }

        public void CloseRegulator()
        {
            CloseAllSockets();
        }

        private void CloseAllSockets()
        {
            foreach (SocketMemory memory in clientSockets)
            {
                memory.socket.Shutdown(SocketShutdown.Both);
                memory.socket.Close();
            }

            _serverSocket.Close();
        }

        private async Task SetupServerAsync()
        {
            Console.WriteLine("Setting up server ...");
            _serverSocket.Bind(new IPEndPoint(IPAddress.Any, port));
            _serverSocket.Listen(backlog);
            _serverSocket.BeginAccept(new AsyncCallback(AcceptCallback), null);

            CustomMessege();
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
                    if (memory.id == lampId)
                    {
                        selected = memory;
                        break;
                    }
                }

                StartCustom(selected, operation);
            }
        }

        private void AcceptCallback(IAsyncResult AR)
        {
            Socket socket;
            try
            {
                socket = _serverSocket.EndAccept(AR);
            }
            catch (ObjectDisposedException)
            {
                return;
            }

            Console.WriteLine("client connected");


            SocketMemory memory = new SocketMemory(socket, new byte[1024], ++connected_clients);
            clientSockets.Add(memory);


            StartPinging(memory);
            _serverSocket.BeginAccept(new AsyncCallback(AcceptCallback), null);
        }


        private void StartPinging(SocketMemory memory)
        {
            Messege msg = new Messege(1, id, "PING", randomSignature);
            Array.Copy(msg.ToBytes(), memory.buffer, msg.Size);
            memory.socket.BeginSend(memory.buffer, 0, memory.buffer.Length, SocketFlags.None, new AsyncCallback(SendPing), memory);

        }
        private void StartCustom(SocketMemory memory, string operation)
        {
            Messege msg = new Messege(1, id, operation, randomSignature);
            Array.Copy(msg.ToBytes(), memory.buffer, msg.Size); //todo delete parralel access to memory
            memory.socket.BeginSend(memory.buffer, 0, memory.buffer.Length, SocketFlags.None, new AsyncCallback(SendCustom), memory);//todo merge with startping

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

            Messege msg = new Messege(memory.buffer);
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
            socket.BeginReceive(memory.buffer, 0, memory.buffer.Length, SocketFlags.None, ReceivePing, memory);
        }

        private void SendCustom(IAsyncResult AR)
        {
            SocketMemory memory = (SocketMemory)AR.AsyncState;
            Socket socket = memory.socket;
            socket.EndSend(AR);
            socket.BeginReceive(memory.buffer, 0, memory.buffer.Length, SocketFlags.None, ReceiveCustom, memory);
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


            Messege msg = new Messege(memory.buffer);

            string text = msg.ToString();
            Console.WriteLine("received: " + text);
        }

        private class SocketMemory
        {
            public Socket socket;
            public byte[] buffer;
            public int id;
            public SocketMemory(Socket socket, byte[] buffer, int id)
            {
                this.socket = socket;
                this.buffer = buffer;
                this.id = id;
            }
        }

    }
}
