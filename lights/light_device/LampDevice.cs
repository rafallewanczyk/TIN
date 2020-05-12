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
        private Socket socket;
        private Socket listener; 
        private int port;
        private bool status = false;
        private int backlog = 1;

        public LampDevice(int port)
        {
            this.port = port;
            socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            listener = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);

            socket.SetSocketOption(SocketOptionLevel.Socket, SocketOptionName.ReuseAddress, true);
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
            socket.Shutdown(SocketShutdown.Both);
            //socket.Close();
            Environment.Exit(0);
        }

        private void SendLoop()
        {
            while (true)
            {
                byte[] receivedBytes = new byte[1024];
                int receive = 0;
                try
                {
                    receive = listener.Receive(receivedBytes, SocketFlags.None);
                }
                catch (SocketException)
                {
                    //regulator disconnected try to connect again
                    Console.WriteLine("regulator disconnected, searching for new regulator");
                    listener.Shutdown(SocketShutdown.Both);
                    listener.Disconnect(true);
                    listener = socket.Accept();
                    continue;
                }
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
                listener.Send(answer, 0, answer.Length, SocketFlags.None);
                Console.WriteLine("current staus :" + status);
            }

        }

        private void ConnectLoop()
        {
            Console.WriteLine("waiting for regulator to respone");
            socket.Bind(new IPEndPoint(IPAddress.Any, port));
            socket.Listen(backlog);

            listener = socket.Accept();
            Console.WriteLine("connected to regulator");
            //int attempts = 0;
            //while (!socket.Connected)
            //{
            //    try
            //    {
            //        attempts++;
            //        socket.Connect(IPAddress.Loopback, port);
            //    }
            //    catch (SocketException)
            //    {
            //        Console.WriteLine("conneciton attmpts :" + attempts);
            //    }
            //}

            //Console.Clear();
            //Console.WriteLine("connected");
        }

    }
}
