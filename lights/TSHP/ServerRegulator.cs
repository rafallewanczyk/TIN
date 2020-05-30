using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Numerics;
using System.Security.Cryptography;
using System.Text;

namespace TSHP
{
    public class ServerRegulator
    {
        private bool end = true;
        private int version, id, size;
        private string data;
        public string operation; 
        private byte[] message;
        private byte[] encryptedData;
        private List<DeviceSetting> settings = new List<DeviceSetting>();

        RSA publicKey;
        RSA privateKey;


        public int Size { get => size; set => size = value; }
        public string Data { get => data; set => data = value; }

        public List<DeviceSetting> Settings { get => settings; }

        public ServerRegulator(byte[] buffer, RSA publicKey, RSA privateKey)
        {
            this.publicKey = publicKey;
            this.privateKey = privateKey;

            encryptedData = buffer;
            Decrypt(); 
            ReadMessege();
        }

        public ServerRegulator(int version, int id, string operation, RSA publicKey, RSA privateKey)
        {
            this.publicKey = publicKey;
            this.privateKey = privateKey; 
            this.version = version;
            this.id = id;
            this.operation = operation; 

            //message = ToBytes();
            //Encrypt(); 
        }

        public void Encrypt()
        {
            try
            {
                encryptedData = publicKey.Encrypt(message, RSAEncryptionPadding.OaepSHA256);
            }
            catch (CryptographicException e)
            {
                Console.WriteLine(e.Message);
            }
        }

        public void Decrypt()
        {

            Console.WriteLine(privateKey.ToXmlString(false)); 
            try
            {
                int offset = 0;
                version = ReadInt(offset, encryptedData);
                offset += 4;

                Size = ReadInt(offset, encryptedData);
                offset += 4; 

                id = ReadInt(offset, encryptedData);
                offset += 4;


                List<byte> decryptedData = new List<byte>(); 
                byte[] codedBlock = new byte[256];
                Array.Copy(encryptedData, size - 256, codedBlock, 0, 256);
                if(publicKey.VerifyData(encryptedData, offset, size - offset - 256, codedBlock, HashAlgorithmName.SHA256, RSASignaturePadding.Pss))
                {
                    Console.WriteLine("odczytano podpis");
                }
                else
                {
                    Console.WriteLine("nie odczytano podpisu"); 
                }
                while(offset < size -256)
                {
                    Array.Copy(encryptedData, offset, codedBlock, 0, 256);
                    codedBlock = privateKey.Decrypt(codedBlock,RSAEncryptionPadding.OaepSHA256);
                    decryptedData.AddRange(codedBlock); 
                    offset += 256; 
                }
                //signature
                message = decryptedData.ToArray();  
            }
            catch (CryptographicException e)
            {
                Console.WriteLine(e.ToString());
            }
        }

        public byte[] ToBytes()
        {
            int data_size = Encoding.UTF8.GetByteCount(data);
            int signature_size = 32; // Encoding.ASCII.GetByteCount(signature);
            Size = sizeof(int) + sizeof(int) + sizeof(int) + data_size + signature_size;
            byte[] messege = new byte[Size];
            int offset = 0;

            byte[] temp = BitConverter.GetBytes(version);
            if (end) Array.Reverse(temp);
            Array.Copy(temp, 0, messege, offset, sizeof(int));
            offset += sizeof(int);

            temp = BitConverter.GetBytes(Size);
            if (end) Array.Reverse(temp);
            Array.Copy(temp, 0, messege, offset, sizeof(int));
            offset += sizeof(int);

            temp = BitConverter.GetBytes(id);
            if (end) Array.Reverse(temp);
            Array.Copy(temp, 0, messege, offset, sizeof(int));
            offset += sizeof(int);

            Array.Copy(Encoding.UTF8.GetBytes(data), 0, messege, offset, data_size);
            offset += data_size;

            return messege;
        }


        public void ReadMessege()
        {
            //checking messege type 
            int offset = 12;
            try
            {
                data = Encoding.UTF8.GetString(message, 0, 13);
                if (data.Equals("CHANGE_CONFIG"))
                {
                    offset += Encoding.UTF8.GetByteCount("CHANGE_CONFIG");
                    while (offset < size)
                    {
                        int newId = ReadInt(offset, message);
                        offset += 4;
                        int newPort = ReadInt(offset, message);
                        offset += 4;
                        int status = ReadInt(offset, message);
                        offset += 4;
                        settings.Add(new ChangeConfig(newId, newPort, status));
                    }
                }
                return; 
            }
            catch (System.ArgumentOutOfRangeException) { }

            try
            {
                operation= Encoding.UTF8.GetString(message, 0, 9);
                if (operation.Equals("CURR_DATA"))
                {
                    Console.WriteLine("parsuje date"); 
                }
                return; 
            }
            catch (System.ArgumentOutOfRangeException) { }
          
            if (operation.Equals("CHANGE_PARAMS"))
            {

            }


        }

        public byte[] CurrDataRe(List<CurrentData> devices)
        {
            List<byte> response = new List<byte>();
            response.AddRange(NumToByte(BitConverter.GetBytes(version)));

            List<byte> data = new List<byte>();
            data.AddRange(Encoding.UTF8.GetBytes("CURR_DATA_RE"));
            foreach (CurrentData device in devices)
            {
                data.AddRange(NumToByte(BitConverter.GetBytes(device.id)));
                data.AddRange(NumToByte(BitConverter.GetBytes(device.state)));
            }
            byte[] encrypted = publicKey.Encrypt(data.ToArray(), RSAEncryptionPadding.OaepSHA256);
            byte[] signature = privateKey.SignData(encrypted, HashAlgorithmName.SHA256, RSASignaturePadding.Pss);

            response.AddRange(NumToByte(BitConverter.GetBytes(encrypted.Length + 12 + signature.Length)));
            response.AddRange(NumToByte(BitConverter.GetBytes(id)));


            response.AddRange(encrypted);
            response.AddRange(signature); 
            return response.ToArray(); 
        }

        
        private byte[] NumToByte(byte[] temp) 
        {
            Array.Reverse(temp);
            return temp; 
        }

        private int ReadInt(int offset, byte[] array)
        {
            byte[] temp = new byte[4];
            Array.Copy(array, offset, temp, 0, 4);
            if (end)
                Array.Reverse(temp);
            return BitConverter.ToInt32(temp, 0);
        }

        public override string ToString()
        {

            return ("version:" + version + " size:" + Size + " id:" + id + " data:" + operation); 
        }
    }
}

