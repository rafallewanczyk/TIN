using System;
using System.Net;
using System.Net.Sockets;
using System.Text;

namespace Lamp_Device{
    class Lamp
    {
        private readonly Socket _client = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
        private int PORT;

        public Lamp(int port)
        {
            PORT = port;
        }

        public void StartConnection()
        {
            ConnectLoop();
        }

        public void StartSending()
        {
            SendLoop();
        }

        public void Close()
        {
            Exit();
        }

        private void Exit()
        {
            _client.Shutdown(SocketShutdown.Both);
            _client.Close();
            Environment.Exit(0);
        }

        private void SendLoop()
        {
            while (true)
            {
                Console.WriteLine("Enter a request: ");
                string request = Console.ReadLine();
                byte[] buffer = Encoding.ASCII.GetBytes(request);
                _client.Send(buffer, 0, buffer.Length, SocketFlags.None);

                byte[] receivedBytes = new byte[1024];
                int receive = _client.Receive(receivedBytes, SocketFlags.None);
                if (receive == 0) return;
                byte[] data = new byte[receive];
                Array.Copy(receivedBytes, data, receive);
                Console.WriteLine("received :" + Encoding.ASCII.GetString(data));
            }
        }

        private void ConnectLoop()
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

