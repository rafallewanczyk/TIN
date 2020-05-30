﻿using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;

namespace TSHP
{
    public class RegulatorDevice
    {
        private int version, id, size;
        private string data, signature;
        private byte[] dataBytes; 
        public byte[] message;
        public byte[] encryptedData;

        RSACryptoServiceProvider publicKey;
        RSACryptoServiceProvider privateKey;

        public int Size { get => size; set => size = value; }
        public string Data { get => data; set => data = value; }

        public RegulatorDevice(byte[] buffer, RSACryptoServiceProvider publicKey, RSACryptoServiceProvider privateKey)
        {
            this.publicKey = publicKey;
            this.privateKey = privateKey;

            //Console.WriteLine(privateKey.ToXmlString(true));
            //Console.WriteLine("--------------------------------");
            //Console.WriteLine(publicKey.ToXmlString(false));


            encryptedData = buffer;
            Decrypt(); 
            ReadMessege(this.message);
        }


        public RegulatorDevice(int version, int id, string data, string signature, RSACryptoServiceProvider publicKey, RSACryptoServiceProvider privateKey)
        {
            this.publicKey = publicKey;
            this.privateKey = privateKey;
            this.version = version;
            this.id = id;
            this.data = data;
            this.signature = signature;

            message = ToBytes();
            Encrypt(); 

        }


        public void Encrypt()
        {
            try
            {
                encryptedData = publicKey.Encrypt(message, true); 
            }
            catch (CryptographicException e)
            {
                Console.WriteLine(e.Message);
                //todo unable to encrypt data exception
            }
        }

        public void Decrypt()
        {
            try
            {
                message = privateKey.Decrypt(encryptedData, true); 
            }
            catch (CryptographicException e)
            {
                Console.WriteLine(e.ToString());
                //todo unable to decrypt data exception
            }
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
            //Array.Copy(Encoding.UTF8.GetBytes(data), 0, dataBytes, 0, data_size);
            offset += data_size;


            Array.Copy(Encoding.UTF8.GetBytes(signature), 0, messege, offset, signature_size);
            return messege;
        }

        public void ReadMessege(byte[] msg)
        {
            int offset = 0;
            version = BitConverter.ToInt32(msg, offset);
            offset += sizeof(int);

            Size = BitConverter.ToInt32(msg, offset);
            offset += sizeof(int);

            id = BitConverter.ToInt32(msg, offset);
            offset += sizeof(int);

            data = Encoding.UTF8.GetString(msg, offset, Size - 3 * sizeof(int) - 32); //todo set constant 
            offset += Encoding.UTF8.GetByteCount(data);

            signature = Encoding.UTF8.GetString(msg, offset, 32);

        }



        public override string ToString()
        {

            return ("version:" + version + " size:" + Size + " id:" + id + " data:" + data + " signature:" + signature);
        }
    }
}
