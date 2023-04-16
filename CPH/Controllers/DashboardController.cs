///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	Solution/Project:  College of Public Health (CPH) Capstone
//	File Name:         DashboardController.cs
//	Description:       YOUR DESCRIPTION HERE
//	Course:            Capstone
//	Author:            Joshua Trimm, trimmj@etsu.edu
//	Created:           10/15/2021
//	Copyright:         Joshua Trimm, 2021
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

namespace CPH.Controllers
{
    using CPH.BusinessLogic.Interfaces;
    using CPH.Models;
    using CPH.Services.Interfaces;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;
    using System.Collections;
    using System.Diagnostics;
    using System.IO;
    using System.Threading.Tasks;

    /// <summary>
    /// To Do:
    /// Comment Using Statements.
    /// What is the controllers namespace for? 
    /// Note above about each page.
    /// Async timeouts defined and configured
    /// https://stackoverflow.com/questions/4238345/asynchronously-wait-for-taskt-to-complete-with-timeout
    ///.
    /// </summary>
    //TODO: Reinstate authorize system
    //[Authorize]
    public class DashboardController : Controller
    {
        /// <summary>
        /// References the _hostEnv..
        /// </summary>
        private readonly IWebHostEnvironment _hostEnv;

        /// <summary>
        /// References the _csvManagement..
        /// </summary>
        private readonly ICSVManagement _csvManagement;

        /// <summary>
        /// Initializes a new instance of the <see cref="DashboardController"/> class.
        /// </summary>
        /// <param name="logger">The logger<see cref="ILogger{DashboardController}"/>.</param>
        /// <param name="hostEnv">The hostEnv<see cref="IWebHostEnvironment"/>.</param>
        /// <param name="csvManagement">The csvManagement<see cref="ICSVManagement"/>.</param>
        public DashboardController(IWebHostEnvironment hostEnv, ICSVManagement csvManagement)
        {
            _hostEnv = hostEnv;
            _csvManagement = csvManagement;
        }

        /// <summary>
        /// The Home.
        /// NEED TO DEFINE.
        /// </summary>
        /// <returns>The <see cref="IActionResult"/>.</returns>
        public IActionResult Home()
        {
            return View();
        }

        /// <summary>
        /// The Chart.
        /// NEEDS TO BE DEFINED.
        /// </summary>
        /// <returns>The <see cref="IActionResult"/>.</returns>
        public IActionResult CreateChart()
        {
            var filePath = _csvManagement.UploadsFolder;
            string[] files = Directory.GetFiles(filePath);

            string[] fileNames = new string[files.Length];

            for (var i = 0; i < files.Length; i++)
            {
                fileNames[i] = (Path.GetFileNameWithoutExtension(files[i]));
            }

            ViewData["Files"] = fileNames;
            return View();
        }

        /// <summary>
        /// The Error.
        /// </summary>
        /// <returns>The <see cref="IActionResult"/>.</returns>
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
