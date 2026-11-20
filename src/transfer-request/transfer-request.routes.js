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

    angular
        .module('transfer-request')
        .config(routes);

    routes.$inject = ['$stateProvider', 'ADMINISTRATION_RIGHTS', 'SHOW_TRANSFERS'];

    function routes($stateProvider, ADMINISTRATION_RIGHTS, SHOW_TRANSFERS) {
        $stateProvider.state('openlmis.stockmanagement.transferRequest', {
            url: '/transferRequest?programId',
            label: 'transferRequest.title',
            isOffline: false,
            priority: 45,
            showInNavigation: SHOW_TRANSFERS,
            accessRights: [ADMINISTRATION_RIGHTS.ORDER_CREATE],
            views: {
                '@openlmis': {
                    controller: 'TransferRequestController',
                    controllerAs: 'vm',
                    templateUrl: 'transfer-request/transfer-request.html'
                }
            },
            resolve: {
                user: function(authorizationService) {
                    return authorizationService.getUser();
                },
                facility: function(facilityFactory) {
                    // stock is always requested for the user's own facility; without one there is nothing to request
                    return facilityFactory.getUserHomeFacility()
                        .catch(function() {
                            return undefined;
                        });
                },
                programs: function(user, facility, programService) {
                    if (!facility) {
                        return [];
                    }
                    return programService.getUserPrograms(user.user_id)
                        .then(function(programs) {
                            return programs.filter(function(program) {
                                return isSupportedBy(facility, program);
                            });
                        });
                },
                partners: function($stateParams, facility, transferService) {
                    if (!$stateParams.programId || !facility) {
                        return [];
                    }
                    return transferService.getPartners(facility.id, $stateParams.programId, 'REQUEST');
                }
            }
        })
            .state('openlmis.stockmanagement.transferRequest.table', {
                url: '/:orderId',
                label: 'transferRequest.edit',
                isOffline: false,
                accessRights: [ADMINISTRATION_RIGHTS.ORDER_CREATE],
                views: {
                    '@openlmis': {
                        controller: 'TransferRequestTableController',
                        controllerAs: 'vm',
                        templateUrl: 'transfer-request/transfer-request-table.html'
                    }
                },
                resolve: {
                    order: function($q, $state, $stateParams, orderService, notificationService, ORDER_TYPE) {
                        return orderService.get($stateParams.orderId)
                            .then(function(order) {
                                if (isEditable(order, ORDER_TYPE)) {
                                    return order;
                                }
                                notificationService.error('transferRequest.notEditable');
                                return $q.reject();
                            })
                            .catch(function() {
                                // the server error handler already shows why the request could not be read
                                $state.go('openlmis.stockmanagement.transferRequest', {
                                    programId: $stateParams.programId
                                });
                                return $q.reject();
                            });
                    },
                    stockCardSummaries: function(order, StockCardSummaryRepositoryImpl) {
                        return new StockCardSummaryRepositoryImpl()
                            .query({
                                programId: order.program.id,
                                facilityId: order.requestingFacility.id
                            })
                            .then(function(page) {
                                return page.content;
                            });
                    }
                }
            });
    }

    function isSupportedBy(facility, program) {
        return (facility.supportedPrograms || []).some(function(supportedProgram) {
            return supportedProgram.id === program.id && supportedProgram.supportActive;
        });
    }

    // only a transfer request that has not been sent yet can be edited on this page
    function isEditable(order, ORDER_TYPE) {
        return order.type === ORDER_TYPE.TRANSFER_REQUEST && order.status === 'CREATING';
    }
})();
