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
        private int privateKeyLength;
        private int publicKeyLength;
        private int regulatorKeyLenght;
        RSA myKeys = new RSAOpenSsl(2048);
        RSA regulatorKey = new RSAOpenSsl(2048);

        public LampDevice(int port)
        {
            this.port = port;
            socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            listener = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);

            socket.SetSocketOption(SocketOptionLevel.Socket, SocketOptionName.ReuseAddress, true);


            try
            {
                using FileStream fs = File.OpenRead(port.ToString() + "Private.rsa");
                byte[] buff = new byte[2048];
                int c = fs.Read(buff, 0, buff.Length);
                myKeys.ImportPkcs8PrivateKey(buff, out privateKeyLength);
            }
            catch (FileNotFoundException)
            {
                using FileStream fs = File.OpenWrite(port.ToString() + "Private.rsa");
                byte[] data = myKeys.ExportPkcs8PrivateKey();
                fs.Write(data, 0, data.Length);

                using FileStream fs1 = File.OpenWrite(port.ToString() + "Public.rsa");
                byte[] data1 = myKeys.ExportSubjectPublicKeyInfo();
                fs1.Write(data1, 0, data1.Length);
            }

            try
            {
                using FileStream fs = File.OpenRead("4000Public.rsa");
                byte[] buff = new byte[2048];
                int c = fs.Read(buff, 0, buff.Length);
                regulatorKey.ImportSubjectPublicKeyInfo(buff, out regulatorKeyLenght);
            }
            catch (FileNotFoundException)
            {
                Utils.Log("cant access regulator key", -1);
            }


        }

        public void StartConnection()
        {
            Utils.Log("waiting for regulator to respone", 0);
            socket.Bind(new IPEndPoint(IPAddress.Any, port));
            socket.Listen(backlog);

            listener = socket.Accept();
            Utils.Log("connected to regulator", 1);
        }
        public void StartSending()
        {
            while (true)
            {
                byte[] receivedBytes = new byte[524];
                int receive = 0;
                try
                {
                    Console.Write("Czekam na wiadomosc");
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
            }

        }

        public void Close()
        {
            socket.Shutdown(SocketShutdown.Both);
            Environment.Exit(0);
        }
    }
}
