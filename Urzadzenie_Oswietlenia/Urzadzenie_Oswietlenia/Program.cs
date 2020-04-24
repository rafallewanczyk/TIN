﻿using System;
using System.Net;
using System.Net.Sockets;
using System.Text;

namespace Urzadzenie_Oswietlenia
{
    class Program
    {

        private static readonly Socket _client = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
        private const int PORT = 100;
        static void Main(string[] args)
        {
            LoopConnect();
            SendLoop();
            Exit(); 
        }

        private static void Exit()
        {
            _client.Shutdown(SocketShutdown.Both);
            _client.Close();
            Environment.Exit(0); 
        }

        private static void SendLoop()
        {
            while (true)
            {
                Console.WriteLine("Enter a request: ");
                string req = Console.ReadLine();
                byte[] buffer = Encoding.ASCII.GetBytes(req);
                _client.Send(buffer, 0, buffer.Length, SocketFlags.None);

                byte[] receivedBuf = new byte[1024];
                int receive = _client.Receive(receivedBuf, SocketFlags.None);
                if (receive == 0) return;
                byte[] data = new byte[receive];
                Array.Copy(receivedBuf, data, receive);
                Console.WriteLine("received :" + Encoding.ASCII.GetString(data)); 
            }
        }

        private static void LoopConnect()
        {
            int attempts = 0; 
            while (!_client.Connected)
            {
                try
                {
                    attempts++; 
                    _client.Connect(IPAddress.Loopback, PORT);
                }
                catch (SocketException)
                {
                    Console.WriteLine("conneciton attmpts :" + attempts); 
                }
            }

            Console.Clear();
            Console.WriteLine("connected"); 
        }
    }
}
