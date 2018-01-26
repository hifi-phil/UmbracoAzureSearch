﻿using System.Xml.Linq;
using UmbracoExamine;

namespace Moriyama.AzureSearch.Umbraco.Application.Examine
{
    public class DummyUmbracoContentIndexer : UmbracoContentIndexer
    {

        
        public override void ReIndexNode(XElement node, string type)
        {

        }
        public override void DeleteFromIndex(string nodeId)
        {

        }

        protected override void PerformIndexAll(string type)
        {

        }

        protected override void AddSingleNodeToIndex(XElement node, string type)
        {
        }

        protected override void PerformIndexRebuild()
        {

        }

        protected override IIndexCriteria GetIndexerData(IndexSet indexSet)
        {
            // examine fields
            var data = base.GetIndexerData(indexSet);

            // azure config
            var path = System.Web.Hosting.HostingEnvironment.MapPath("~/");
            var serviceClient = new AzureSearchIndexClient(path);
            
            var examineStandardFields = data.StandardFields;
            var examineUserFields = data.UserFields;

            var azureStandardFields = serviceClient.GetStandardUmbracoFields().ToDictionary(f => f.Name);
            var azureUserFields = serviceClient.GetConfiguration().SearchFields.ToDictionary(f => f.Name);
            
            var standardToRemove = examineStandardFields.Where(examineField => !azureStandardFields.Keys.InvariantContains(examineField.Name));
            var validStandardFields = examineStandardFields.Except(standardToRemove);

            var userToRemove = examineUserFields.Where(examineField => !azureUserFields.Keys.InvariantContains(examineField.Name));
            var validUserFields = examineUserFields.Except(userToRemove);

            var newData = new IndexCriteria(validStandardFields, validUserFields, data.IncludeNodeTypes, data.ExcludeNodeTypes, data.ParentNodeId);

            return newData;
        }
    }
}