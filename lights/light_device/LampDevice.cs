using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
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
        RSACryptoServiceProvider myKeys = new RSACryptoServiceProvider(2048);
        RSACryptoServiceProvider regulatorKey = new RSACryptoServiceProvider(2048);

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

                using FileStream fs1 = File.OpenRead(port.ToString() + "Public.rsa");
                c = fs1.Read(buff, 0, buff.Length);
                //myKeys.ImportSubjectPublicKeyInfo(buff, out publicKeyLength);

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
                using FileStream fs = File.OpenRead("C:\\Users\\rafal\\source\\repos\\TIN\\lights\\light_regulator\\bin\\Debug\\netcoreapp3.1\\4000Public.rsa");
                byte[] buff = new byte[2048];
                int c = fs.Read(buff, 0, buff.Length);
                regulatorKey.ImportSubjectPublicKeyInfo(buff, out regulatorKeyLenght);
            }
            catch (FileNotFoundException)
            {
                Console.WriteLine("cant access regulator key");
            }

            Console.WriteLine(myKeys.ToXmlString(true)); 


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
                byte[] receivedBytes = new byte[256];
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

                RegulatorDevice msg = new RegulatorDevice(data, regulatorKey, myKeys);

                Console.WriteLine("received :" + msg);

                if (msg.Data.Equals("PING"))
                {
                    msg = new RegulatorDevice(1, port, "REPING", "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad", regulatorKey, myKeys);
                }
                //else if (msg.Data.Equals("GETSTATUS"))
                //{
                //    msg = new RegulatorDevice(1, port, status.ToString(), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
                //}
                //else if (msg.Data.Equals("SET1"))
                //{
                //    status = true;
                //    msg = new RegulatorDevice(1, port, status.ToString(), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
                //}
                //else if (msg.Data.Equals("SET0"))
                //{
                //    status = false;
                //    msg = new RegulatorDevice(1, port, status.ToString(), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
                //}


                byte[] answer = msg.encryptedData;
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
