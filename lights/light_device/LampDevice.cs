using KeyHolder;
using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
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
        RSA myKeys;
        RSA regulatorKey;

        public LampDevice(int port)
        {
            this.port = port;
            socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            listener = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);

            socket.SetSocketOption(SocketOptionLevel.Socket, SocketOptionName.ReuseAddress, true);


            myKeys = KeyLoader.Generate(port.ToString());
            regulatorKey = KeyLoader.Load("4000Public.rsa"); 
          
        }

        public void StartConnection()
        {
            Utils.Log("waiting for regulator to respone", 0);
            socket.Bind(new IPEndPoint(IPAddress.Any, port));
            socket.Listen(backlog);

            Utils.Log("connected to regulator", 1);
        }
        public void StartSending()
        {
            while (true)
            {
                listener = socket.Accept();
                byte[] receivedBytes = new byte[524];
                int receive = 0;
                try
                {
                    receive = listener.Receive(receivedBytes, SocketFlags.None);
                }
                catch (SocketException)
                {
                    //regulator disconnected try to connect again
                    Utils.Log("regulator disconnected, searching for new regulator", -1);
                    listener.Shutdown(SocketShutdown.Both);
                    listener.Disconnect(true);
                    listener = socket.Accept();
                    continue;
                }
                byte[] data = new byte[receive];
                Array.Copy(receivedBytes, data, receive);

                if(receive == 0)
                {
                    continue;
                }
                RegulatorDevice msg = new RegulatorDevice(data, regulatorKey, myKeys);
                if(msg.Message == null)
                {
                    return;
                }

                Utils.Log("received :" + msg, 0);

                if (msg.operation.Equals("PING"))
                {
                    msg = new RegulatorDevice(1, port, "REPING",  regulatorKey, myKeys);
                }
                else if (msg.operation.Equals("GETSTATUS"))
                {
                    msg = new RegulatorDevice(1, port, status.ToString(), regulatorKey, myKeys);
                }
                else if (msg.operation.Equals("SET1"))
                {
                    status = true;
                    msg = new RegulatorDevice(1, port, status.ToString(), regulatorKey, myKeys);
                }
                else if (msg.operation.Equals("SET0"))
                {
                    status = false;
                    msg = new RegulatorDevice(1, port, status.ToString(), regulatorKey, myKeys);
                }



                listener.Send(msg.ToBytes(), 0, msg.ToBytes().Length, SocketFlags.None);
                Utils.Log("current staus :" + status, 0);
                listener.Close(); 
            }

        }

        public void Close()
        {
            socket.Shutdown(SocketShutdown.Both);
            Environment.Exit(0);
        }
    }
}
