using System;
using System.Collections.Generic;
using System.Text;
using System.Net;
using System.Net.Sockets;
using TSHP;
namespace light_device
{
    class LampDevice
    {
        private readonly Socket _client = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
        private int port;
        private bool status = false;

        public LampDevice(int port)
        {
            this.port = port;
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
                byte[] receivedBytes = new byte[1024];
                int receive = _client.Receive(receivedBytes, SocketFlags.None);
                //todo handle server closing exception
                byte[] data = new byte[receive];
                Array.Copy(receivedBytes, data, receive);

                Messege msg = new Messege(data);
                Console.WriteLine("received :" + msg);

                if (msg.Data.Equals("PING"))
                {
                    msg = new Messege(1, 1, "REPING", "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
                }
                else if (msg.Data.Equals("GETSTATUS"))
                {
                    msg = new Messege(1, 1, "STATUS" + status, "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
                }
                else if (msg.Data.Equals("SET1"))
                {
                    status = true;
                    msg = new Messege(1, 1, "SET" + status, "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
                }
                else if (msg.Data.Equals("SET0"))
                {
                    status = false;
                    msg = new Messege(1, 1, "SET" + status, "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
                }




                byte[] answer = msg.ToBytes();
                _client.Send(answer, 0, answer.Length, SocketFlags.None);
                Console.WriteLine("current staus :" + status);
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
                    _client.Connect(IPAddress.Loopback, port);
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
