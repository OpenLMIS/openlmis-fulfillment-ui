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
        .module('transfer-send')
        .config(routes);

    routes.$inject = ['$stateProvider', 'FULFILLMENT_RIGHTS', 'SHOW_TRANSFERS'];

    function routes($stateProvider, FULFILLMENT_RIGHTS, SHOW_TRANSFERS) {
        $stateProvider.state('openlmis.stockmanagement.transferSend', {
            url: '/transferSend?programId&destinationId',
            label: 'transferSend.title',
            isOffline: false,
            priority: 46,
            showInNavigation: SHOW_TRANSFERS,
            accessRights: [FULFILLMENT_RIGHTS.SHIPMENTS_EDIT],
            views: {
                '@openlmis': {
                    controller: 'TransferSendController',
                    controllerAs: 'vm',
                    templateUrl: 'transfer-send/transfer-send.html'
                }
            },
            resolve: {
                user: function(authorizationService) {
                    return authorizationService.getUser();
                },
                programs: function(user, programService) {
                    return programService.getUserPrograms(user.user_id);
                },
                facility: function(facilityFactory) {
                    // stock is always sent from the user's own facility; without one there is nothing to send from
                    return facilityFactory.getUserHomeFacility()
                        .catch(function() {
                            return undefined;
                        });
                },
                canSend: function(user, facility, permissionService) {
                    if (!facility) {
                        return false;
                    }
                    return permissionService.hasPermissionWithAnyProgram(user.user_id, {
                        right: FULFILLMENT_RIGHTS.SHIPMENTS_EDIT,
                        facilityId: facility.id
                    })
                        .then(function() {
                            return true;
                        })
                        .catch(function() {
                            return false;
                        });
                },
                partners: function($stateParams, facility, canSend, transferService) {
                    if (!$stateParams.programId || !canSend) {
                        return [];
                    }
                    return transferService.getPartners(facility.id, $stateParams.programId, 'SEND');
                }
            }
        })
            .state('openlmis.stockmanagement.transferSend.creation', {
                url: '/creation',
                isOffline: false,
                accessRights: [FULFILLMENT_RIGHTS.SHIPMENTS_EDIT],
                views: {
                    '@openlmis': {
                        controller: 'TransferSendCreationController',
                        controllerAs: 'vm',
                        templateUrl: 'transfer-send/transfer-send-creation.html'
                    }
                },
                resolve: {
                    program: function(programs, $stateParams) {
                        return findById(programs, $stateParams.programId);
                    },
                    destination: function(partners, $stateParams) {
                        return findById(partners, $stateParams.destinationId);
                    },
                    orderableGroups: function(existingStockOrderableGroupsFactory, program, facility, destination,
                        moment, $state, $stateParams) {
                        if (!program || !facility || !destination) {
                            $state.go('openlmis.stockmanagement.transferSend', {
                                programId: $stateParams.programId,
                                destinationId: null
                            });
                            return [];
                        }

                        return existingStockOrderableGroupsFactory
                            .getGroupsWithNotZeroSoh({}, program, facility)
                            .then(function(groups) {
                                return withoutExpiredLots(groups, moment);
                            });
                    }
                }
            });
    }

    function findById(items, id) {
        return items.filter(function(item) {
            return item.id === id;
        })[0];
    }

    function withoutExpiredLots(groups, moment) {
        var today = moment().format('YYYY-MM-DD');

        return groups
            .map(function(group) {
                return group.filter(function(item) {
                    return !item.lot || !item.lot.expirationDate ||
                        moment(item.lot.expirationDate).format('YYYY-MM-DD') >= today;
                });
            })
            .filter(function(group) {
                return group.length > 0;
            });
    }
})();
