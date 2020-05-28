using System;
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
            Console.WriteLine("waiting for regulator to respone");
            socket.Bind(new IPEndPoint(IPAddress.Any, port));
            socket.Listen(backlog);

            listener = socket.Accept();
            Console.WriteLine("connected to regulator");
        }
        public void StartSending()
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

                RegulatorDevice msg = new RegulatorDevice(data);
                Console.WriteLine("received :" + msg);

                if (msg.Data.Equals("PING"))
                {
                    msg = new RegulatorDevice(1, port, "REPING", "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
                }
                else if (msg.Data.Equals("GETSTATUS"))
                {
                    msg = new RegulatorDevice(1, port, status.ToString(), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
                }
                else if (msg.Data.Equals("SET1"))
                {
                    status = true;
                    msg = new RegulatorDevice(1, port, status.ToString(), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
                }
                else if (msg.Data.Equals("SET0"))
                {
                    status = false;
                    msg = new RegulatorDevice(1, port, status.ToString(), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
                }


                byte[] answer = msg.ToBytes();
                listener.Send(answer, 0, answer.Length, SocketFlags.None);
                Console.WriteLine("current staus :" + status);
            }

        }

        public void Close()
        {
            socket.Shutdown(SocketShutdown.Both);
            Environment.Exit(0);
        }


    }
}
