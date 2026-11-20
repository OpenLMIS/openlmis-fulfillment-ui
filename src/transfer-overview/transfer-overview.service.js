/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name transfer-overview.transferOverviewService
     *
     * @description
     * Loads the transfers of the home facility for the Transfers page, the facilities it transfers
     * with, and the rights the user has there.
     */
    angular
        .module('transfer-overview')
        .service('transferOverviewService', service);

    service.$inject = [
        '$q', 'orderRepository', 'orderService', 'transferService', 'permissionService', 'ORDER_TYPE',
        'ORDER_STATUS', 'FULFILLMENT_RIGHTS', 'ADMINISTRATION_RIGHTS', 'TRANSFER_OVERVIEW'
    ];

    function service($q, orderRepository, orderService, transferService, permissionService, ORDER_TYPE,
                     ORDER_STATUS, FULFILLMENT_RIGHTS, ADMINISTRATION_RIGHTS, TRANSFER_OVERVIEW) {

        var CREATING = 'CREATING';

        this.getRights = getRights;
        this.getPartners = getPartners;
        this.search = search;
        this.count = count;

        /**
         * @ngdoc method
         * @methodOf transfer-overview.transferOverviewService
         * @name getRights
         *
         * @description
         * Checks once which transfer actions the user may take at the home facility.
         *
         * @param  {String}  userId     the current user
         * @param  {String}  facilityId the home facility
         * @return {Promise}            the rights: canRequest (ORDER_CREATE), canFulfil (SHIPMENTS_EDIT),
         *                              canViewShipments, canViewPods and podManagePrograms, the ids of the
         *                              programs with PODS_MANAGE
         */
        function getRights(userId, facilityId) {
            return permissionService.load(userId)
                .then(function(permissions) {
                    var atFacility = permissions.filter(function(permission) {
                        return permission.facilityId === facilityId;
                    });

                    return {
                        canRequest: hasRight(atFacility, ADMINISTRATION_RIGHTS.ORDER_CREATE),
                        canFulfil: hasRight(atFacility, FULFILLMENT_RIGHTS.SHIPMENTS_EDIT),
                        canViewShipments: hasRight(atFacility, FULFILLMENT_RIGHTS.SHIPMENTS_VIEW) ||
                            hasRight(atFacility, FULFILLMENT_RIGHTS.SHIPMENTS_EDIT),
                        canViewPods: hasRight(atFacility, FULFILLMENT_RIGHTS.PODS_VIEW) ||
                            hasRight(atFacility, FULFILLMENT_RIGHTS.PODS_MANAGE),
                        podManagePrograms: atFacility
                            .filter(function(permission) {
                                return permission.right === FULFILLMENT_RIGHTS.PODS_MANAGE;
                            })
                            .map(function(permission) {
                                return permission.programId;
                            })
                    };
                })
                .catch(function() {
                    return {
                        podManagePrograms: []
                    };
                });
        }

        /**
         * @ngdoc method
         * @methodOf transfer-overview.transferOverviewService
         * @name getPartners
         *
         * @description
         * Gets the facilities the home facility transfers with in the given programs: the ones it may
         * request from for incoming stock, the ones it may send to for outgoing stock. Asks only when the
         * user has the right the backend checks for it, so a missing right gives no partners, not an error.
         *
         * @param  {String}  facilityId the home facility
         * @param  {Array}   programIds the programs to get the partners for
         * @param  {String}  tab        incoming or outgoing
         * @param  {Object}  rights     the rights from getRights
         * @return {Promise}            the partner facilities, each once, sorted by name
         */
        function getPartners(facilityId, programIds, tab, rights) {
            var incoming = tab === TRANSFER_OVERVIEW.INCOMING;

            if (incoming ? !rights.canRequest : !rights.canFulfil) {
                return $q.resolve([]);
            }

            return $q.all(programIds.map(function(programId) {
                return transferService.getPartners(facilityId, programId, incoming ? 'REQUEST' : 'SEND')
                    .catch(function() {
                        return [];
                    });
            }))
                .then(function(lists) {
                    var byId = {};

                    lists.forEach(function(list) {
                        list.forEach(function(partner) {
                            byId[partner.id] = partner;
                        });
                    });

                    return Object.keys(byId)
                        .map(function(id) {
                            return byId[id];
                        })
                        .sort(function(a, b) {
                            return a.name.localeCompare(b.name);
                        });
                });
        }

        /**
         * @ngdoc method
         * @methodOf transfer-overview.transferOverviewService
         * @name search
         *
         * @description
         * Gets a page of the transfers of the home facility on the given tab, newest first.
         *
         * @param  {String}  facilityId the home facility
         * @param  {String}  tab        incoming or outgoing
         * @param  {Object}  filters    programId, type, status (OPEN, ALL or an order status), partnerId,
         *                              page and size
         * @return {Promise}            the page of orders
         */
        function search(facilityId, tab, filters) {
            var params = buildParams(facilityId, tab, filters);

            params.page = filters.page;
            params.size = filters.size;
            params.sort = 'createdDate,desc';
            return orderRepository.search(params);
        }

        /**
         * @ngdoc method
         * @methodOf transfer-overview.transferOverviewService
         * @name count
         *
         * @description
         * Counts the transfers of the home facility on the given tab.
         *
         * @param  {String}  facilityId the home facility
         * @param  {String}  tab        incoming or outgoing
         * @param  {Object}  filters    as for search; the page is ignored
         * @return {Promise}            the number of matching orders
         */
        function count(facilityId, tab, filters) {
            var params = buildParams(facilityId, tab, filters);

            params.page = 0;
            params.size = 1;
            return orderService.search(params)
                .then(function(page) {
                    return page.totalElements;
                });
        }

        function buildParams(facilityId, tab, filters) {
            var incoming = tab === TRANSFER_OVERVIEW.INCOMING,
                params = {
                    type: filters.type ? [filters.type] : [ORDER_TYPE.TRANSFER_REQUEST, ORDER_TYPE.TRANSFER_PUSH],
                    programId: filters.programId || undefined,
                    status: getStatuses(filters.status, incoming)
                };

            if (incoming) {
                params.requestingFacilityId = facilityId;
                params.supplyingFacilityId = filters.partnerId || undefined;
            } else {
                params.supplyingFacilityId = facilityId;
                params.requestingFacilityId = filters.partnerId || undefined;
            }

            return params;
        }

        // drafts are shown only to the requester; the supplier sees a request once it is sent
        function getStatuses(status, incoming) {
            var statuses = Object.keys(ORDER_STATUS).map(function(key) {
                return ORDER_STATUS[key];
            });

            if (status === TRANSFER_OVERVIEW.STATUS_ALL) {
                return incoming ? undefined : statuses;
            }
            if (status && status !== TRANSFER_OVERVIEW.STATUS_OPEN) {
                return [status];
            }

            statuses = statuses.filter(function(value) {
                return value !== ORDER_STATUS.RECEIVED && value !== ORDER_STATUS.CANCELLED;
            });
            return incoming ? [CREATING].concat(statuses) : statuses;
        }

        function hasRight(permissions, right) {
            return permissions.some(function(permission) {
                return permission.right === right;
            });
        }
    }

})();
