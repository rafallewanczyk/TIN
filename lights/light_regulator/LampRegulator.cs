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
        private List<Socket> _clientSockets = new List<Socket>();
        private Socket _serverSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
        private int backlog;
        private int port;
        private int id;
        private String randomSignature = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"; //only for testing purpose 


        public LampRegulator(int port, int backlog, int id)
        {
            this.backlog = backlog;
            this.port = port;
            this.id = id;
        }

        public void StartRegulator()
        {
            SetupServer();
        }

        public void CloseRegulator()
        {
            CloseAllSockets();
        }

        private void CloseAllSockets()
        {
            foreach (Socket socket in _clientSockets)
            {
                socket.Shutdown(SocketShutdown.Both);
                socket.Close();
            }

            _serverSocket.Close();
        }

        private void SetupServer()
        {
            Console.WriteLine("Setting up server ...");
            _serverSocket.Bind(new IPEndPoint(IPAddress.Any, port));
            _serverSocket.Listen(backlog);
            _serverSocket.BeginAccept(new AsyncCallback(AcceptCallback), null);
            Console.Read();

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
            _clientSockets.Add(socket);


            StartPinging(new SocketMemory(socket, new byte[1024]));
            _serverSocket.BeginAccept(new AsyncCallback(AcceptCallback), null);
        }

        private void StartPinging(SocketMemory memory)
        {
            memory.buffer = Messege.CreateMessege(1, id, "PING", randomSignature);
            memory.socket.BeginSend(memory.buffer, 0, memory.buffer.Length, SocketFlags.None, new AsyncCallback(SendCallback), memory);

        }




        private void ReceiveCallback(IAsyncResult AR)
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
                _clientSockets.Remove(socket);
                return;
            }

            string text = Messege.DecodeMessage(memory.buffer);
            Console.WriteLine("Text received: " + text);

            Array.Copy(Encoding.ASCII.GetBytes("sending ping"), memory.buffer, Encoding.ASCII.GetBytes("sending ping").Length);
            Thread.Sleep(10000);

            //todo catch client disconnected exception 
            StartPinging(memory);
        }


        private void SendCallback(IAsyncResult AR)
        {
            SocketMemory memory = (SocketMemory)AR.AsyncState;
            Socket socket = memory.socket;
            socket.EndSend(AR);
            socket.BeginReceive(memory.buffer, 0, memory.buffer.Length, SocketFlags.None, ReceiveCallback, memory);
        }

        private class SocketMemory
        {
            public Socket socket;
            public byte[] buffer;
            public SocketMemory(Socket socket, byte[] buffer)
            {
                this.socket = socket;
                this.buffer = buffer;
            }
        }

    }
}
