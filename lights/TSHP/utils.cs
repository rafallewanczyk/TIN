using System;
using System.Collections.Generic;
using System.Text;

namespace TSHP
{
    public static class utils
    {
		public static T[] SubArray<T>(this T[] array, int offset, int length)
		{
			T[] result = new T[length];
			Array.Copy(array, offset, result, 0, length);
			return result;
		}
	}
}
