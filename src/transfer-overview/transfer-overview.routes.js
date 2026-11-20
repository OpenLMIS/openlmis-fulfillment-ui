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
        .module('transfer-overview')
        .config(routes);

    routes.$inject = ['$stateProvider', 'ADMINISTRATION_RIGHTS', 'FULFILLMENT_RIGHTS', 'SHOW_TRANSFERS'];

    function routes($stateProvider, ADMINISTRATION_RIGHTS, FULFILLMENT_RIGHTS, SHOW_TRANSFERS) {
        $stateProvider.state('openlmis.stockmanagement.transfers', {
            url: '/transfers?tab&programId&type&status&partnerId&page&size',
            label: 'transferOverview.title',
            isOffline: false,
            // right below Receive
            priority: 35,
            showInNavigation: SHOW_TRANSFERS,
            accessRights: [
                ADMINISTRATION_RIGHTS.ORDER_CREATE,
                FULFILLMENT_RIGHTS.SHIPMENTS_EDIT
            ],
            areAllRightsRequired: false,
            views: {
                '@openlmis': {
                    controller: 'TransferOverviewController',
                    controllerAs: 'vm',
                    templateUrl: 'transfer-overview/transfer-overview.html'
                }
            },
            resolve: {
                user: function(authorizationService) {
                    return authorizationService.getUser();
                },
                facility: function(facilityFactory) {
                    // the page lists the transfers of the user's own facility; without one it shows nothing
                    return facilityFactory.getUserHomeFacility()
                        .catch(function() {
                            return undefined;
                        });
                },
                rights: function(user, facility, transferOverviewService) {
                    if (!facility) {
                        return {
                            podManagePrograms: []
                        };
                    }
                    return transferOverviewService.getRights(user.user_id, facility.id);
                },
                tab: function($stateParams, rights, TRANSFER_OVERVIEW) {
                    if ($stateParams.tab === TRANSFER_OVERVIEW.INCOMING ||
                        $stateParams.tab === TRANSFER_OVERVIEW.OUTGOING) {
                        return $stateParams.tab;
                    }
                    // a supplier that cannot request stock starts on what it has to send
                    return !rights.canRequest && rights.canFulfil
                        ? TRANSFER_OVERVIEW.OUTGOING
                        : TRANSFER_OVERVIEW.INCOMING;
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
                partners: function($stateParams, facility, programs, tab, rights, transferOverviewService) {
                    if (!facility) {
                        return [];
                    }
                    var programIds = $stateParams.programId
                        ? [$stateParams.programId]
                        : programs.map(function(program) {
                            return program.id;
                        });

                    return transferOverviewService.getPartners(facility.id, programIds, tab, rights);
                },
                orders: function($stateParams, facility, tab, paginationService, transferOverviewService) {
                    return paginationService.registerUrl($stateParams, function(stateParams) {
                        if (!facility) {
                            return undefined;
                        }
                        return transferOverviewService.search(facility.id, tab, stateParams);
                    });
                },
                counts: function($stateParams, facility, tab, orders, paginationService,
                    transferOverviewService, TRANSFER_OVERVIEW) {
                    var counts = {};

                    if (!facility) {
                        return counts;
                    }

                    // the other tab has its own partners, so only the program, type and status apply to it
                    var otherTab = tab === TRANSFER_OVERVIEW.INCOMING
                            ? TRANSFER_OVERVIEW.OUTGOING
                            : TRANSFER_OVERVIEW.INCOMING,
                        filters = angular.extend({}, $stateParams, {
                            partnerId: undefined
                        });

                    counts[tab] = paginationService.getTotalItems();
                    return transferOverviewService.count(facility.id, otherTab, filters)
                        .then(function(count) {
                            counts[otherTab] = count;
                            return counts;
                        })
                        .catch(function() {
                            return counts;
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
})();
