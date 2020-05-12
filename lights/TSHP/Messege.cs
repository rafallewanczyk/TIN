using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Text;

namespace TSHP
{
    public class Messege
    {
        private int version, id, size;
        private string data, signature;
        private byte[] messege;
        private List<DeviceSetting> settings = new List<DeviceSetting>();

        public int Size { get => size; set => size = value; }
        public string Data { get => data; set => data = value; }

        public List<DeviceSetting> Settings { get => settings;  }

        public Messege(int version, int id, string data, string signature)
        {
            this.version = version;
            this.id = id;
            this.data = data;
            this.signature = signature;
        }

        public byte[] ToBytes()
        {
            int data_size = Encoding.UTF8.GetByteCount(data);
            int signature_size = 32; // Encoding.ASCII.GetByteCount(signature);
            Size = sizeof(int) + sizeof(int) + sizeof(int) + data_size + signature_size;
            byte[] messege = new byte[Size];
            int offset = 0;

            Array.Copy(BitConverter.GetBytes(version), 0, messege, offset, sizeof(int));
            offset += sizeof(int);

            Array.Copy(BitConverter.GetBytes(Size), 0, messege, offset, sizeof(int));
            offset += sizeof(int);

            Array.Copy(BitConverter.GetBytes(id), 0, messege, offset, sizeof(int));
            offset += sizeof(int);

            Array.Copy(Encoding.UTF8.GetBytes(data), 0, messege, offset, data_size);
            offset += data_size;

            Array.Copy(Encoding.UTF8.GetBytes(signature), 0, messege, offset, signature_size);
            return messege;
        }

        public void CalculateMessege()
        {
            int offset = 0;
            version = BitConverter.ToInt32(messege, offset);
            offset += sizeof(int);

            Size = BitConverter.ToInt32(messege, offset);
            offset += sizeof(int);

            id = BitConverter.ToInt32(messege, offset);
            offset += sizeof(int);

            data = Encoding.UTF8.GetString(messege, offset, Size - 3 * sizeof(int) - 32); //todo set constant 
            offset += Encoding.UTF8.GetByteCount(data);

            signature = Encoding.UTF8.GetString(messege, offset, 32);

        }

        public Messege(byte[] messege)
        {
            this.messege = messege;
        }


        public void ReadMessegeFromServer()
        {

            //reading header 
            int offset = 0;
            version = ReadInt(offset);
            offset += 4;

            Size = ReadInt(offset);
            offset += 4;

            id = ReadInt(offset);
            offset += 4;

            //checking messege type 
            data = Encoding.UTF8.GetString(messege, offset, 13);
            if (data.Equals("CHANGE_CONFIG"))
            {
                offset += Encoding.UTF8.GetByteCount("CHANGE_CONFIG"); 
                while(offset < size)
                {
                    int newId = ReadInt(offset);
                    offset += 4;
                    int newPort = ReadInt(offset);
                    offset += 4;
                    int status = ReadInt(offset);
                    offset += 4;
                    settings.Add(new ChangeConfig(newId, newPort, status)); 
                }
            }


        }

        private int ReadInt(int offset)
        {
            byte[] temp = new byte[4];
            Array.Copy(messege, offset, temp, 0, 4);
            Array.Reverse(temp);
            return BitConverter.ToInt32(temp, 0); 
        }

        public override string ToString()
        {

            return ("version:" + version + " size:" + Size + " id:" + id + " data:" + data + " signature:" + signature);
        }
    }
}

