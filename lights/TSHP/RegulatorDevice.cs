using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace TSHP
{
    public class RegulatorDevice
    {
        private int version, id, size;
        public string operation;
        private byte[] dataBytes;
        public byte[] message;
        public byte[] encryptedData;

        RSA publicKey;
        RSA privateKey;

        public int Size { get => size; set => size = value; }
        public int Version { get => version; set => version = value; }
        public int Id { get => id; set => id = value; }
        public int Size1 { get => size; set => size = value; }

        public RegulatorDevice(byte[] buffer, RSA publicKey, RSA privateKey)
        {
            this.publicKey = publicKey;
            this.privateKey = privateKey;

            encryptedData = buffer;
            Decrypt();
            ReadMessege(message); 
        }


        public RegulatorDevice(int version, int id, string operation, RSA publicKey, RSA privateKey)
        {
            this.publicKey = publicKey;
            this.privateKey = privateKey;
            this.version = version;
            this.id = id;
            this.operation = operation;
        }

        public void Decrypt()
        {

            try
            {
                int offset = 0;
                version = BitConverter.ToInt32(encryptedData, offset);
                offset += 4;

                Size = BitConverter.ToInt32(encryptedData, offset);
                offset += 4;

                id = BitConverter.ToInt32(encryptedData, offset);
                offset += 4;

                List<byte> decryptedData = new List<byte>();
                byte[] codedBlock = new byte[256];
                Array.Copy(encryptedData, size - 256, codedBlock, 0, 256);
                if (!publicKey.VerifyData(encryptedData, offset, size - offset - 256, codedBlock, HashAlgorithmName.SHA256, RSASignaturePadding.Pss))
                {
                    Utils.Log("nie odczytano podpisu", -1);
                    return;
                }
                while (offset < size - 256)
                {
                    Array.Copy(encryptedData, offset, codedBlock, 0, 256);
                    codedBlock = privateKey.Decrypt(codedBlock, RSAEncryptionPadding.OaepSHA256);
                    decryptedData.AddRange(codedBlock);
                    offset += 256;
                }
                //signature
                message = decryptedData.ToArray();
            }
            catch (Exception e)
            {
                Utils.Log(e.ToString(), -1);
            }
        }

        public byte[] ToBytes()
        {
            List<byte> response = new List<byte>();

            List<byte> data = new List<byte>();
            data.AddRange(Encoding.UTF8.GetBytes(operation));
            byte[] encryptedData = publicKey.Encrypt(data.ToArray(), RSAEncryptionPadding.OaepSHA256);
            byte[] signature = privateKey.SignData(encryptedData, HashAlgorithmName.SHA256, RSASignaturePadding.Pss);

            response.AddRange(BitConverter.GetBytes(version));
            response.AddRange(BitConverter.GetBytes(12 + encryptedData.Length + signature.Length));
            response.AddRange(BitConverter.GetBytes(id));
            response.AddRange(encryptedData);
            response.AddRange(signature);


            return response.ToArray();


        }

        public void ReadMessege(byte[] msg)
        {

            operation = Encoding.UTF8.GetString(msg, 0, msg.Length); //todo set constant 

        }



        public override string ToString()
        {

            return ("version:" + version + " size:" + Size + " id:" + id + " data:" + operation);
        }
    }
}
