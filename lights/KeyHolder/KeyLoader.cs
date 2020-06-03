using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using TSHP;

namespace KeyHolder
{
    public static class KeyLoader
    {
        public static RSACng Load(string path)
        {
            RSACng returnKey = new RSACng(2048);
            try
            {
                FileStream fs = File.OpenRead(path);
                byte[] buff = new byte[2048];
                int c = fs.Read(buff, 0, buff.Length);
                returnKey.ImportSubjectPublicKeyInfo(buff, out _);
            }
            catch (FileNotFoundException)
            {
                Utils.Log("cant access server key", -1);
                return null;
            }
            return returnKey;
        }
        public static RSACng Generate(string path)
        {
            RSACng returnKey = new RSACng(2048);
            try
            {
                using FileStream fs = File.OpenRead(path + "Private.rsa");
                byte[] buff = new byte[2048];
                int c = fs.Read(buff, 0, buff.Length);
                returnKey.ImportPkcs8PrivateKey(buff, out _);

            }
            catch (FileNotFoundException)
            {
                using FileStream fs = File.OpenWrite(path + "Private.rsa");
                byte[] data = returnKey.ExportPkcs8PrivateKey();
                fs.Write(data, 0, data.Length);

                using FileStream fs1 = File.OpenWrite(path + "Public.rsa");
                byte[] data1 = returnKey.ExportSubjectPublicKeyInfo();
                fs1.Write(data1, 0, data1.Length);
            }
            return returnKey;
        }

    }

}
