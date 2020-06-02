using System;
using System.IO;
using System.Net.Sockets;

namespace TSHP
{
    public static class Utils
    {
        public static void Log(string message, int status)
        {
            switch (status)
            {
                case -1:
                    Console.ForegroundColor = ConsoleColor.Red;
                    break;

                case 0:
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    break;

                case 1:
                    Console.ForegroundColor = ConsoleColor.Green;
                    break;

                default:
                    Console.ForegroundColor = ConsoleColor.White;
                    break;
            }

            Console.WriteLine(message); 
            Console.ForegroundColor = ConsoleColor.Yellow;
        }
        
        public static byte[] ReadFromSocket(Socket socket)
        {
                 using (var resultStream = new MemoryStream())
                {
                    const int CHUNK_SIZE = 256;
                    byte[] buffer = new byte[CHUNK_SIZE];
                    int bytesReceived;
                    while (socket.Available > 0)
                    {
                        bytesReceived = socket.Receive(buffer, buffer.Length, SocketFlags.None);
                        byte[] actual = new byte[bytesReceived];
                        Buffer.BlockCopy(buffer, 0, actual, 0, bytesReceived);
                        resultStream.Write(actual, 0, actual.Length);
                    }
                    return resultStream.ToArray();
                }
        }

    }
}
