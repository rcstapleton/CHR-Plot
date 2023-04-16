///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	Solution/Project:  College of Public Health (CPH) Capstone
//	File Name:         CSVManagement.cs
//	Description:       YOUR DESCRIPTION HERE
//	Course:            Capstone
//	Author:            Joshua Trimm, trimmj@etsu.edu
//	Created:           10/7/2021
//	Copyright:         Joshua Trimm, 2021
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

namespace CPH.BusinessLogic
{
    using CPH.BusinessLogic.Interfaces;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.Configuration;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Security.Cryptography;
    using System.Threading.Tasks;

    /// <summary>
    /// Defines the <see cref="CSVManagement" />.
    /// </summary>
    public class CSVManagement : ICSVManagement
    {
        /// <summary>
        /// Gets the post processed files from the uploads folder..
        /// </summary>
        public string UploadsFolder
        {
            get
            {
                return $"{_hostEnvironment.WebRootPath}{_config.GetSection("CSVFilePaths").GetSection("Copied").Value}";
            }
        }

        /// <summary>
        /// Gets the path of the original CSV's that have been uploaded..
        /// </summary>
        public string OriginalsFolder
        {
            get
            {
                return $@"{_hostEnvironment.WebRootPath}{_config.GetSection("CSVFilePaths").GetSection("Original").Value}";
            }
        }

        /// <summary>
        /// references the _config - a project defined file..
        /// </summary>
        private readonly IConfiguration _config;

        /// <summary>
        /// References the _hostEnvironment - created by C#..
        /// </summary>
        private readonly IWebHostEnvironment _hostEnvironment;

        /// <summary>
        /// Initializes a new instance of the <see cref="CSVManagement"/> class.
        /// </summary>
        /// <param name="hostEnvironment">The hostEnvironment<see cref="IWebHostEnvironment"/>.</param>
        /// <param name="configuration">The configuration<see cref="IConfiguration"/>.</param>
        
        
        
        public CSVManagement(IWebHostEnvironment hostEnvironment, IConfiguration configuration)
        {

            _config = configuration;
            _hostEnvironment = hostEnvironment;

            // Creates the directors for the CSV files to be stored if they do not exist.
            CreateCSVUploadFolder();
        }

        /// <summary>
        /// The CreateCSVUploadFolder.
        /// Create folders for original and post-processed CHR files.
        /// </summary>
        private void CreateCSVUploadFolder()
        {
            if (!Directory.Exists(UploadsFolder))
                Directory.CreateDirectory(UploadsFolder);
            Directory.CreateDirectory(OriginalsFolder);
        }
    }
}
