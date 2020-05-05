using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Sockets;
using System.Text;

namespace Lamp_Regulator 
{
    class Regulator
    {
        private byte[] _buffer = new byte[1024];
        private List<Socket> _clientSockets = new List<Socket>();
        private Socket _serverSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
        private int BACKLOG;
        private int PORT;


        public Regulator(int port, int backlog)
        {
            BACKLOG = backlog;
            PORT = port;
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
            _serverSocket.Bind(new IPEndPoint(IPAddress.Any, PORT));
            _serverSocket.Listen(BACKLOG);
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

            byte[] buffer = new byte[1024];
            Console.WriteLine("client connected");
            _clientSockets.Add(socket);
            socket.BeginReceive(buffer, 0, buffer.Length, SocketFlags.None, ReceiveCallback, new SocketMemory(socket, buffer));
            _serverSocket.BeginAccept(new AsyncCallback(AcceptCallback), null);
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

            byte[] dataBuf = new byte[received];
            Array.Copy(memory.buffer, dataBuf, received);
            string text = Encoding.ASCII.GetString(dataBuf);
            Console.WriteLine("Text received: " + text);

            string response = string.Empty;
            if (text.ToLower() == "exit")
            {
                socket.Shutdown(SocketShutdown.Both);
                socket.Close();
                _clientSockets.Remove(socket);
                Console.WriteLine("client disconnected");
                return;

            }
            else
            {
                response = text;
            }

            Array.Copy(Encoding.ASCII.GetBytes(response), memory.buffer, received);
            socket.BeginSend(memory.buffer, 0, memory.buffer.Length, SocketFlags.None, new AsyncCallback(SendCallback), memory);
        }


        private void SendCallback(IAsyncResult AR)
        {
            SocketMemory memory= (SocketMemory)AR.AsyncState;
            Socket socket = memory.socket; 
            socket.EndSend(AR);
            socket.BeginReceive(memory.buffer, 0,memory.buffer.Length, SocketFlags.None, ReceiveCallback, memory);
        }

        private class SocketMemory
        {
            public Socket socket;
            public byte[] buffer = new byte[1024];
            public SocketMemory(Socket socket, byte[] buffer)
            {
                this.socket = socket;
                this.buffer = buffer; 
            }
        }
        
    }
}
