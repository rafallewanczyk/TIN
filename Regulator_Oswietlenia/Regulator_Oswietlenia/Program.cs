using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Sockets;
using System.Text;


namespace Regulator_Oswietlenia
{
    class Program
    {
        private static byte[] _buffer = new byte[1024]; 
        private static List<Socket> _clientSockets = new List<Socket>(); 
        private static Socket _serverSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp); 
        static void Main(string[] args)
        {
            SetupServer();
            Console.ReadLine();
            CloseAllSockets(); 
        }

        private static void CloseAllSockets()
        {
            foreach(Socket socket in _clientSockets)
            {
                socket.Shutdown(SocketShutdown.Both);
                socket.Close(); 
            }

            _serverSocket.Close(); 
        }

        private static void SetupServer()
        {
            Console.WriteLine("Setting up server ...");
            _serverSocket.Bind(new IPEndPoint(IPAddress.Any, 100));
            _serverSocket.Listen(5); 
            _serverSocket.BeginAccept(new AsyncCallback(AcceptCallback), null); 

        }

        private static void AcceptCallback(IAsyncResult AR)
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
            socket.BeginReceive(_buffer, 0, _buffer.Length, SocketFlags.None, ReceiveCallback, socket); 
            _serverSocket.BeginAccept(new AsyncCallback(AcceptCallback), null);
        }

        private static void ReceiveCallback(IAsyncResult AR)
        {
            Socket socket = (Socket) AR.AsyncState;
            int received; 

            try
            {
                received = socket.EndReceive(AR);
            }
            catch(SocketException)
            {
                Console.WriteLine("client forcefully disconnected");
                socket.Close();
                _clientSockets.Remove(socket);
                return; 
            }
            
            byte[] dataBuf = new byte[received];
            Array.Copy(_buffer, dataBuf, received);
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

            byte[] data = Encoding.ASCII.GetBytes(response);
            socket.BeginSend(data, 0, data.Length, SocketFlags.None, new AsyncCallback(SendCallback), socket);
        }


        private static void SendCallback(IAsyncResult AR)
        {
            Socket socket = (Socket) AR.AsyncState;
            socket.EndSend(AR);
            socket.BeginReceive(_buffer, 0, _buffer.Length, SocketFlags.None, ReceiveCallback, socket); 
        }
    }
}
