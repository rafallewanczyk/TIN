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
        public string operation;
        private byte[] message;
        private byte[] encryptedData;
        public short target;
        private List<DeviceSetting> settings = new List<DeviceSetting>();

        RSA publicKey;
        RSA privateKey;


        public int Size { get => size; set => size = value; }

        public List<DeviceSetting> Settings { get => settings; }
        public int Id { get => id; set => id = value; }

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
                utils.Log(e.Message, -1);
            }
        }

        public void Decrypt()
        {

            try
            {
                int offset = 0;
                version = ReadInt(offset, encryptedData, out offset);

                Size = ReadInt(offset, encryptedData, out offset);

                id = ReadInt(offset, encryptedData, out offset);


                List<byte> decryptedData = new List<byte>();
                byte[] codedBlock = new byte[256];
                Array.Copy(encryptedData, size - 256, codedBlock, 0, 256);
                if (!publicKey.VerifyData(encryptedData, offset, size - offset - 256, codedBlock, HashAlgorithmName.SHA256, RSASignaturePadding.Pss))
                {
                    utils.Log("nie odczytano podpisu", -1);
                    return;
                }
                while (offset < size - 256)
                {
                    codedBlock = new byte[256];
                    Array.Copy(encryptedData, offset, codedBlock, 0, 256);
                    codedBlock = privateKey.Decrypt(codedBlock, RSAEncryptionPadding.OaepSHA256);
                    decryptedData.AddRange(codedBlock);
                    offset += 256;
                }
                //signature
                message = decryptedData.ToArray();
            }
            catch (CryptographicException e)
            {
                utils.Log(e.ToString(), -1);
            }
        }

        //public byte[] ToBytes()
        //{
        //    int data_size = Encoding.UTF8.GetByteCount(data);
        //    int signature_size = 32; // Encoding.ASCII.GetByteCount(signature);
        //    Size = sizeof(int) + sizeof(int) + sizeof(int) + data_size + signature_size;
        //    byte[] messege = new byte[Size];
        //    int offset = 0;

        //    byte[] temp = BitConverter.GetBytes(version);
        //    if (end) Array.Reverse(temp);
        //    Array.Copy(temp, 0, messege, offset, sizeof(int));
        //    offset += sizeof(int);

        //    temp = BitConverter.GetBytes(Size);
        //    if (end) Array.Reverse(temp);
        //    Array.Copy(temp, 0, messege, offset, sizeof(int));
        //    offset += sizeof(int);

        //    temp = BitConverter.GetBytes(id);
        //    if (end) Array.Reverse(temp);
        //    Array.Copy(temp, 0, messege, offset, sizeof(int));
        //    offset += sizeof(int);

        //    Array.Copy(Encoding.UTF8.GetBytes(data), 0, messege, offset, data_size);
        //    offset += data_size;

        //    return messege;
        //}


        public void ReadMessege()
        {
            //checking messege type 
            int offset = 0;
            try
            {
                operation = Encoding.UTF8.GetString(message, 0, 13);
                if (operation.Equals("CHANGE_CONFIG"))
                {
                    offset += Encoding.UTF8.GetByteCount("CHANGE_CONFIG");
                    while (offset < message.Length)
                    {
                        int newId = ReadInt(offset, message, out offset);
                        int newPort = ReadInt(offset, message, out offset);
                        int hostNameLength = ReadInt(offset, message, out offset);
                        string hostName = Encoding.UTF8.GetString(message, offset, hostNameLength);
                        offset += hostNameLength;
                        int keyLength = ReadInt(offset, message, out offset);
                        byte[] key = new byte[keyLength];
                        Array.Copy(message, offset, key, 0, keyLength);
                        offset += keyLength + 1;
                        bool target = (message[offset] != 0);
                        offset++;
                        settings.Add(new ChangeConfig(newId, newPort, hostName, key, target));
                    }
                }
            }
            catch (System.ArgumentOutOfRangeException) { }

            try
            {
                operation = Encoding.UTF8.GetString(message, 0, 9);
                if (operation.Equals("CURR_DATA"))
                {
                }
            }
            catch (System.ArgumentOutOfRangeException) { }

            try
            {
                operation = Encoding.UTF8.GetString(message, 0, "CHANGE_PARAMS".Length);
                if (operation.Equals("CHANGE_PARAMS"))
                {
                    offset += Encoding.UTF8.GetByteCount("CHANGE_PARAMS");
                    id = ReadInt(offset, message, out offset);
                    target = ReadShort(offset, message, out offset); 

                }
            }
            catch (System.ArgumentOutOfRangeException) { }
            

        }

        public byte[] CurrDataRe(List<CurrentData> devices)
        {
            List<byte> response = new List<byte>();

            List<byte> data = new List<byte>();
            data.AddRange(Encoding.UTF8.GetBytes("CURRENT_DATA_RES"));
            data.AddRange(NumToByte(BitConverter.GetBytes((short)1)));
            foreach (CurrentData device in devices)
            {
                data.AddRange(NumToByte(BitConverter.GetBytes(device.id)));
                data.AddRange(NumToByte(BitConverter.GetBytes(device.state)));
            }
            byte[] encrypted = publicKey.Encrypt(data.ToArray(), RSAEncryptionPadding.OaepSHA256);
            byte[] signature = privateKey.SignData(encrypted, HashAlgorithmName.SHA256, RSASignaturePadding.Pss);

            response.AddRange(NumToByte(BitConverter.GetBytes(version)));
            response.AddRange(NumToByte(BitConverter.GetBytes(encrypted.Length + 12 + signature.Length)));
            response.AddRange(NumToByte(BitConverter.GetBytes(id)));
            response.AddRange(encrypted);
            response.AddRange(signature);
            return response.ToArray();
        }

        public byte[] ChangeConfigRe()
        {
            List<byte> response = new List<byte>();

            List<byte> data = new List<byte>();
            data.AddRange(Encoding.UTF8.GetBytes("CHANGE_CONFIG_RE"));
            data.AddRange(NumToByte(BitConverter.GetBytes((short)1)));
            byte[] encrypted = publicKey.Encrypt(data.ToArray(), RSAEncryptionPadding.OaepSHA256);
            byte[] signature = privateKey.SignData(encrypted, HashAlgorithmName.SHA256, RSASignaturePadding.Pss);

            response.AddRange(NumToByte(BitConverter.GetBytes(version)));
            response.AddRange(NumToByte(BitConverter.GetBytes(encrypted.Length + 12 + signature.Length)));
            response.AddRange(NumToByte(BitConverter.GetBytes(id)));
            response.AddRange(encrypted);
            response.AddRange(signature);
            return response.ToArray();
        }
        public byte[] ChangeParamsRe(short result)
        {
            List<byte> response = new List<byte>();

            List<byte> data = new List<byte>();
            data.AddRange(Encoding.UTF8.GetBytes("CHANGE_PARAMS_RE"));
            data.AddRange(NumToByte(BitConverter.GetBytes(result))); 
            byte[] encrypted = publicKey.Encrypt(data.ToArray(), RSAEncryptionPadding.OaepSHA256);
            byte[] signature = privateKey.SignData(encrypted, HashAlgorithmName.SHA256, RSASignaturePadding.Pss);

            response.AddRange(NumToByte(BitConverter.GetBytes(version)));
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

        private int ReadInt(int offset, byte[] array, out int newOffset)
        {
            byte[] temp = new byte[4];
            Array.Copy(array, offset, temp, 0, 4);
            if (end)
                Array.Reverse(temp);
            newOffset = offset + 4;
            return BitConverter.ToInt32(temp, 0);
        }
        private short ReadShort(int offset, byte[] array, out int newOffset)
        {
            byte[] temp = new byte[2];
            Array.Copy(array, offset, temp, 0, 2);
            if (end)
                Array.Reverse(temp);
            newOffset = offset + 2;
            return BitConverter.ToInt16(temp, 0);
        }

        public override string ToString()
        {

            return ("version:" + version + " size:" + Size + " id:" + id + " data:" + operation);
        }
    }
}

