﻿using Moriyama.AzureSearch.Umbraco.Application.Interfaces;
using System.Collections.Generic;

namespace Moriyama.AzureSearch.Umbraco.Application.Models
{
    public class SearchContent : BaseContent, ISearchContent
    {
        public int Id { get; set; }

        public bool IsContent { get; set; }
        public bool IsMedia { get; set; }
        public string[] Path { get; set; }

        public IDictionary<string, object> Properties { get; set; }

    }
}
