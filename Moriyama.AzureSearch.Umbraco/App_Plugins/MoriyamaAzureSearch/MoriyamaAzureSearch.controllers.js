﻿function moriyamaAzureSearchController($scope, umbRequestHelper, $log, $http) {

    $scope.configLoaded = false;

    $http.get('/umbraco/backoffice/api/AzureSearchApi/GetIndexers').then(function (response) {
        $scope.indexers = response.data;
        $scope.loadIndexer(response.data[0]);
    });

    $scope.loadIndexer = function(name) {

        $scope.showConfigTest = false;
        $scope.showIndexDropCreate = false;
        $scope.showReIndexContent = false;
        $scope.currentIndexer = name;

        $http.get('/umbraco/backoffice/api/AzureSearchApi/GetConfiguration?name=' + name).then(function (response) {
            $scope.config = response.data;
            $scope.configLoaded = true;
        });

        $http.get('/umbraco/backoffice/api/AzureSearchApi/GetStandardFields?name=' + name).then(function (response) {
            $scope.umbracoFields = response.data;
        });

        $http.get('/umbraco/backoffice/api/AzureSearchApi/GetSearchIndexes?name='+ name).then(function (response) {
            $scope.searchIndexes = response.data;
        });

    }
    
    $scope.updateServiceName = function() {

        $scope.updating = true;
        $http.get('/umbraco/backoffice/api/AzureSearchApi/ServiceName?name='+ $scope.currentIndexer +'&value=' + escape($scope.config.SearchServiceName)).then(function (response) {
            $scope.updating = false;
        });


    };

    $scope.updateServiceApiKey = function () {

        $scope.updating = true;
        $http.get('/umbraco/backoffice/api/AzureSearchApi/ServiceApiKey?name=' + $scope.currentIndexer + '&value=' + escape($scope.config.SearchServiceAdminApiKey)).then(function (response) {
            $scope.updating = false;
        });

        
    };

    $scope.testConfig = function () {
        $http.get('/umbraco/backoffice/api/AzureSearchApi/GetTestConfig?name=' + $scope.currentIndexer).then(function (response) {
            $scope.configTest = response.data;
            $scope.showConfigTest = true;
        });
    };

    $scope.dropCreateIndex = function () {

        if (!confirm('Are you sure!'))
            return;

        $scope.showIndexDropCreate = true;
        $http.get('/umbraco/backoffice/api/AzureSearchApi/GetDropCreateIndex?name=' + $scope.currentIndexer).then(function (response) {
            $scope.dropCreateResult = response.data;      
        });
    };

    $scope.reindexContent = function () {
        
        if (!confirm('Are you sure!'))
            return;
        $scope.finishedIndexing = false;
        $scope.showReIndexContent = false;
        $http.get('/umbraco/backoffice/api/AzureSearchApi/GetReIndexSetup?name=' + $scope.currentIndexer).then(function (response) {
            $scope.reIndexContentResult = response.data;
            $scope.showReIndexContent = true;
            if($scope.currentIndexer == 'umbraco') 
                $scope.reindexContentPage(response.data.SessionId, 1);
            else
                $scope.reindexSimpleDataPage(response.data.SessionId, 1);
        });
    };

    $scope.reindexContentPage = function (sessionId, page) {
        $scope.TypeProcessing = 'content';
        $http.get('/umbraco/backoffice/api/AzureSearchApi/GetReIndexContent?sessionId=' + escape(sessionId) + '&page=' + page).then(function (response) {
            $scope.reIndexContentResult = response.data;

            if (!response.data.Error && !response.data.Finished) {
                $scope.reindexContentPage(sessionId, page + 1);
            } else if (response.data.Finished) {
                $scope.TypeProcessing = 'media';
                $scope.reindexMediaPage(response.data.SessionId, 1);
            }
        });
    };
    
    $scope.reindexMediaPage = function (sessionId, page) {

        $http.get('/umbraco/backoffice/api/AzureSearchApi/GetReIndexMedia?sessionId=' + escape(sessionId) + '&page=' + page).then(function (response) {
            $scope.reIndexContentResult = response.data;
            if (!response.data.Error && !response.data.Finished) {
                $scope.reindexMediaPage(sessionId, page + 1);
            } else if (response.data.Finished) {
                $scope.TypeProcessing = 'member';
                $scope.reindexMemberPage(response.data.SessionId, 1);
            }
        });
    };

    $scope.reindexMemberPage = function (sessionId, page) {

        $http.get('/umbraco/backoffice/api/AzureSearchApi/GetReIndexMember?sessionId=' + escape(sessionId) + '&page=' + page).then(function (response) {
            $scope.reIndexContentResult = response.data;
            if (!response.data.Error && !response.data.Finished) {
                $scope.reindexMemberPage(sessionId, page + 1);
            } else if (response.data.Finished) {
                $scope.finishedIndexing = true;
            }
        });
    };

    $scope.reindexSimpleDataPage = function (sessionId, page) {
        $scope.TypeProcessing = $scope.indexer;
        $http.get('/umbraco/backoffice/api/AzureSearchApi/GetReIndexExternal?name=' + $scope.currentIndexer + '&sessionId=' + escape(sessionId) + '&page=' + page).then(function (response) {
            $scope.reIndexContentResult = response.data;
            if (!response.data.Error && !response.data.Finished) {
                $scope.reindexExternalPage(sessionId, page + 1);
            } else if (response.data.Finished) {
                $scope.finishedIndexing = true;
            }
        });
    };

}

angular.module("umbraco").controller("Umbraco.Dashboard.MoriyamaAzureSearchController", moriyamaAzureSearchController);