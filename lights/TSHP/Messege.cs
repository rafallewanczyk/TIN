using System;
using System.Text;

namespace TSHP
{
    public class Messege
    {
        public static byte[] CreateMessege(int version, int id, string data, string signature)
        {
            int data_size = Encoding.ASCII.GetByteCount(data);
            int signature_size = 64; // Encoding.ASCII.GetByteCount(signature);
            int size = sizeof(int) + sizeof(int) + sizeof(int) + data_size + signature_size;
            byte[] messege = new byte[size];
            int offset = 0;

            Array.Copy(BitConverter.GetBytes(version), 0, messege, offset, sizeof(int));
            offset += sizeof(int);

            Array.Copy(BitConverter.GetBytes(size), 0, messege, offset, sizeof(int));
            offset += sizeof(int);

            Array.Copy(BitConverter.GetBytes(id), 0, messege, offset, sizeof(int));
            offset += sizeof(int);

            Array.Copy(Encoding.ASCII.GetBytes(data), 0, messege, offset, data_size);
            offset += data_size;

            Array.Copy(Encoding.ASCII.GetBytes(signature), 0, messege, offset, signature_size);
            return messege;
        }

        public static string DecodeMessage(byte[] messege)
        {
            int offset = 0;
            int version = BitConverter.ToInt32(messege, offset);
            offset += sizeof(int);

            int size = BitConverter.ToInt32(messege, offset);
            offset += sizeof(int);

            int id = BitConverter.ToInt32(messege, offset);
            offset += sizeof(int);

            string data = Encoding.ASCII.GetString(messege, offset, size - 3 * sizeof(int) - 64); //todo set constant 
            offset += Encoding.ASCII.GetByteCount(data);

            string signature = Encoding.ASCII.GetString(messege, offset, 64);

            return ("version:" + version + " size:" + size + " id:" + id + " data:" + data + " signature:" + signature);
        }
    }
}

