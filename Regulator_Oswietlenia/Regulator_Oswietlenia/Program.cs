using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Sockets;
using System.Reflection.Metadata.Ecma335;
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
        }

        private static void SetupServer()
        {
            Console.WriteLine("Setting up server ...");
            _serverSocket.Bind(new IPEndPoint(IPAddress.Any, 8080));
            _serverSocket.Listen(5); 
            _serverSocket.BeginAccept(new AsyncCallback(AcceptCallback), null); 

        }

        private static void AcceptCallback(IAsyncResult AR)
        {
            Socket socket = _serverSocket.EndAccept(AR);
            Console.WriteLine("client connected");
            _clientSockets.Add(socket);
            socket.BeginReceive(_buffer, 0, _buffer.Length, SocketFlags.None, ReceiveCallback, socket); 
            _serverSocket.BeginAccept(new AsyncCallback(AcceptCallback), null);
        }

        private static void ReceiveCallback(IAsyncResult AR)
        {
            Socket socket = (Socket) AR.AsyncState;

            int received = socket.EndReceive(AR);
            byte[] dataBuf = new byte[received];
            Array.Copy(_buffer, dataBuf, received);
            string text = Encoding.ASCII.GetString(dataBuf);
            Console.WriteLine("Text received: +" + text);

            string response = string.Empty;
            if (text.ToLower() != "get time")
            {
                response = "Invalid request";
            }
            else
            {
                response = DateTime.Now.ToLongTimeString(); 
            }

            byte[] data = Encoding.ASCII.GetBytes(response);
            socket.BeginSend(data, 0, data.Length, SocketFlags.None, new AsyncCallback(SendCallback), socket);
        }


        private static void SendCallback(IAsyncResult AR)
        {
            Socket socket = (Socket) AR.AsyncState;
            socket.EndSend(AR); 
        }
    }
}
