///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	Solution/Project:  College of Public Health (CPH) Capstone
//	File Name:         ICSVManagement.cs
//	Description:       YOUR DESCRIPTION HERE
//	Course:            Capstone
//	Author:            Joshua Trimm, trimmj@etsu.edu
//	Created:           10/7/2021
//	Copyright:         Joshua Trimm, 2021
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

namespace CPH.BusinessLogic.Interfaces
{
    using Microsoft.AspNetCore.Http;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    /// <summary>
    /// Defines the <see cref="ICSVManagement" />.
    /// </summary>
    public interface ICSVManagement
    {
        string UploadsFolder { get; }
        string OriginalsFolder { get; }
    }
}
