(function() {

    'use strict';

    angular
        .module('openlmis.requisitions')
        .service('RequisitionService', requisitionService);

    requisitionService.$inject = ['$q', '$resource', 'messageService', 'OpenlmisURL', 'RequisitionURL', 'RequisitionFactory', 'Source', 'Column', '$ngBootbox', 'Notification', 'DateUtils'];

    function requisitionService($q, $resource, messageService, OpenlmisURL, RequisitionURL, RequisitionFactory, Source, Column, $ngBootbox, Notification, DateUtils) {

        var resource = $resource(RequisitionURL('/api/requisitions/:id'), {}, {
            'initiate': {
                url: RequisitionURL('/api/requisitions/initiate'),
                method: 'POST'
            },
            'search': {
                url: RequisitionURL('/api/requisitions/search'),
                method: 'GET',
                isArray: true,
                transformResponse: transformRequisitionListResponse
            },
            'forApproval': {
                url: RequisitionURL('/api/requisitions/requisitionsForApproval'),
                method: 'GET',
                isArray: true,
                transformResponse: transformRequisitionListResponse
            },
            'getTemplate': {
                url: RequisitionURL('/api/requisitionTemplates/search'),
                method: 'GET'
            },
            'forConvert': {
                url: RequisitionURL('/api/requisitions/requisitionsForConvert'),
                method: 'GET',
                isArray: true,
                transformResponse: transformResponseForConvert
            },
            'convertToOrder': {
                url: RequisitionURL('/api/requisitions/convertToOrder'),
                method: 'POST',
                transformRequest: transformRequest
            },
            'getApprovedProducts': {
                url: OpenlmisURL('/referencedata/api/facilities/:id/approvedProducts'),
                method: 'GET',
                isArray: true
            }
        });

        var service = {
            get: get,
            initiate: initiate,
            search: search,
            forApproval: forApproval,
            forConvert: forConvert,
            convertToOrder: convertToOrder
        };
        return service;

        function get(id) {
            var deferred = $q.defer();

            resource.get({
                id: id
            }).$promise.then(function(requisition) {
                $q.all([
                    resource.getTemplate({
                        program: requisition.program.id
                    }).$promise,
                    resource.getApprovedProducts({
                        id: requisition.facility.id,
                        fullSupply: false,
                        programId: requisition.program.id
                    }).$promise
                ]).then(function(responses) {
                    resolve(requisition, responses[0], responses[1]);
                }, function() {
                    resolve(requisition);
                });
            }, error);

            return deferred.promise;

            function resolve(requisition, template, approvedProducts) {
                deferred.resolve(RequisitionFactory(requisition, template, approvedProducts));
            }

            function error() {
                deferred.reject();
            }
        }

        function initiate(facility, program, suggestedPeriod, emergency) {
            return resource.initiate({
                facility: facility,
                program: program,
                suggestedPeriod: suggestedPeriod,
                emergency: emergency
            }, {}).$promise;
        }

        function search(programId, facilityId, statuses, emergency, startDate, endDate) {
            var searchParams = {
                facility: facilityId
            };
            if(programId) searchParams['program'] = programId;
            if(statuses && angular.isArray(statuses) && statuses.length > 0) searchParams['requisitionStatus'] = statuses;
            if(emergency) searchParams['emergency'] = emergency;
            if(startDate) searchParams['createdDateFrom'] = startDate;
            if(endDate) searchParams['createdDateTo'] = endDate;
            return resource.search(searchParams).$promise;
        }

        function forApproval() {
            return resource.forApproval().$promise;
        }

        function forConvert(params) {
            return resource.forConvert(params).$promise;
        }

        function convertToOrder(requisitions) {
            var deferred = $q.defer();

            $ngBootbox.confirm(messageService.get('msg.question.confirmation')).then(function() {
                resource.convertToOrder(requisitions).$promise.then(function() {
                    deferred.resolve();
                    Notification.success('msg.rnr.converted.to.order');
                }, function() {
                    deferred.reject();
                    Notification.error('msg.error.occurred');
                });
            }, function() {
                deferred.reject();
            });

            return deferred.promise;
        }

        function transformRequest(requisitionsWithDepots) {
            var body = [];
            angular.forEach(requisitionsWithDepots, function(requisitionWithDepots) {
                body.push({
                    requisitionId: requisitionWithDepots.requisition.id,
                    supplyingDepotId: requisitionWithDepots.requisition.supplyingFacility
                });
            });
            return angular.toJson(body);
        }

        function transformRequisitionListResponse(data, headers, status) {
            return transformResponse(data, status, function(requisitions) {
                angular.forEach(requisitions, transformRequisition);
                return requisitions;
            });
        }

        function transformResponseForConvert(data, headers, status) {
            return transformResponse(data, status, function(items) {
                angular.forEach(items, function(item) {
                    transformRequisition(item.requisition);
                });
                return items;
            });
        }

        function transformResponse(data, status, transformer) {
            if (status === 200) {
                return transformer(angular.fromJson(data));
            }
            return data;
        }

        function transformRequisition(requisition) {
            requisition.createdDate = DateUtils.toDate(requisition.createdDate);
            requisition.processingPeriod.startDate = DateUtils.toDate(requisition.processingPeriod.startDate);
            requisition.processingPeriod.endDate = DateUtils.toDate(requisition.processingPeriod.endDate);
            requisition.processingPeriod.processingSchedule.modifiedDate = DateUtils.toDate(requisition.processingPeriod.processingSchedule.modifiedDate);
        }
    }

})();
