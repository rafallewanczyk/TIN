using System;
using System.Text;

namespace TSHP
{
    public class Messege
    {
        private int version, id, size;
        private string data, signature;

        public int Size { get => size; set => size = value; }
        public string Data { get => data; set => data = value; }

        public Messege(int version, int id, string data, string signature)
        {
            this.version = version;
            this.id = id;
            this.data = data;
            this.signature = signature;
        }

        public byte[] ToBytes()
        {
            int data_size = Encoding.ASCII.GetByteCount(data);
            int signature_size = 64; // Encoding.ASCII.GetByteCount(signature);
            Size = sizeof(int) + sizeof(int) + sizeof(int) + data_size + signature_size;
            byte[] messege = new byte[Size];
            int offset = 0;

            Array.Copy(BitConverter.GetBytes(version), 0, messege, offset, sizeof(int));
            offset += sizeof(int);

            Array.Copy(BitConverter.GetBytes(Size), 0, messege, offset, sizeof(int));
            offset += sizeof(int);

            Array.Copy(BitConverter.GetBytes(id), 0, messege, offset, sizeof(int));
            offset += sizeof(int);

            Array.Copy(Encoding.ASCII.GetBytes(data), 0, messege, offset, data_size);
            offset += data_size;

            Array.Copy(Encoding.ASCII.GetBytes(signature), 0, messege, offset, signature_size);
            return messege;
        }

        public Messege(byte[] messege)
        {
            int offset = 0;
            version = BitConverter.ToInt32(messege, offset);
            offset += sizeof(int);

            Size = BitConverter.ToInt32(messege, offset);
            offset += sizeof(int);

            id = BitConverter.ToInt32(messege, offset);
            offset += sizeof(int);

            data = Encoding.ASCII.GetString(messege, offset, Size - 3 * sizeof(int) - 64); //todo set constant 
            offset += Encoding.ASCII.GetByteCount(data);

            signature = Encoding.ASCII.GetString(messege, offset, 64);

        }

        public override string ToString()
        {

            return ("version:" + version + " size:" + Size + " id:" + id + " data:" + data + " signature:" + signature);
        }
    }
}

