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
     * @ngdoc controller
     * @name transfer-overview.controller:TransferOverviewController
     *
     * @description
     * Lists the transfers of the user's home facility, on the incoming or the outgoing tab, with the
     * next action the user may take on each.
     */
    angular
        .module('transfer-overview')
        .controller('TransferOverviewController', controller);

    controller.$inject = [
        '$state', '$stateParams', 'facility', 'rights', 'tab', 'programs', 'partners', 'orders', 'counts',
        'messageService', 'loadingModalService', 'notificationService', 'proofOfDeliveryManageService',
        'ORDER_TYPE', 'ORDER_STATUS', 'TRANSFER_OVERVIEW'
    ];

    function controller($state, $stateParams, facility, rights, tab, programs, partners, orders, counts,
                        messageService, loadingModalService, notificationService, proofOfDeliveryManageService,
                        ORDER_TYPE, ORDER_STATUS, TRANSFER_OVERVIEW) {
        var vm = this;

        vm.$onInit = onInit;
        vm.search = search;
        vm.getTabParams = getTabParams;
        vm.perform = perform;

        /**
         * @ngdoc property
         * @propertyOf transfer-overview.controller:TransferOverviewController
         * @name orders
         * @type {Array}
         *
         * @description
         * The orders on the current page, each with its $action: the label, the kind (primary, secondary
         * or text) and the state or method that performs it. Orders without an action have none.
         */
        vm.orders = undefined;

        function onInit() {
            vm.facility = facility;
            vm.rights = rights;
            vm.tab = tab;
            vm.incoming = tab === TRANSFER_OVERVIEW.INCOMING;
            vm.counts = counts;
            vm.programs = programs;
            vm.partners = partners;
            vm.types = [ORDER_TYPE.TRANSFER_REQUEST, ORDER_TYPE.TRANSFER_PUSH].map(toOption('orderType.'));
            vm.statuses = getStatusOptions();

            vm.program = findById(programs, $stateParams.programId);
            vm.partner = findById(partners, $stateParams.partnerId);
            vm.type = $stateParams.type;
            vm.status = isStatusOf(vm.incoming, $stateParams.status)
                ? $stateParams.status
                : TRANSFER_OVERVIEW.STATUS_OPEN;

            vm.orders = orders.map(function(order) {
                order.$action = getAction(order);
                return order;
            });
        }

        /**
         * @ngdoc method
         * @methodOf transfer-overview.controller:TransferOverviewController
         * @name search
         *
         * @description
         * Reloads the page with the selected filters, from the first page. A cleared status shows all.
         */
        function search() {
            var status = vm.status || TRANSFER_OVERVIEW.STATUS_ALL;

            $state.go('openlmis.stockmanagement.transfers', angular.extend({}, $stateParams, {
                tab: vm.tab,
                programId: vm.program ? vm.program.id : undefined,
                partnerId: vm.partner ? vm.partner.id : undefined,
                type: vm.type || undefined,
                status: status === TRANSFER_OVERVIEW.STATUS_OPEN ? undefined : status,
                page: 0
            }), {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf transfer-overview.controller:TransferOverviewController
         * @name getTabParams
         *
         * @description
         * Gives the state params that open the given tab. The program, type and status filters are kept;
         * the partner belongs to one tab, so it is cleared, and so is a status the tab does not offer.
         *
         * @param  {String} newTab incoming or outgoing
         * @return {Object}        the state params
         */
        function getTabParams(newTab) {
            return {
                tab: newTab,
                programId: $stateParams.programId,
                type: $stateParams.type,
                status: isStatusOf(newTab === TRANSFER_OVERVIEW.INCOMING, $stateParams.status)
                    ? $stateParams.status
                    : undefined,
                partnerId: undefined,
                page: 0,
                size: $stateParams.size
            };
        }

        /**
         * @ngdoc method
         * @methodOf transfer-overview.controller:TransferOverviewController
         * @name perform
         *
         * @description
         * Opens the page of the order's action: the transfer request, the shipment or the proof of
         * delivery, which is looked up by the order first.
         *
         * @param {Object} order the order with its $action
         */
        function perform(order) {
            if (order.$action.pod) {
                openPod(order);
            } else {
                $state.go(order.$action.state, order.$action.params);
            }
        }

        function openPod(order) {
            loadingModalService.open();
            proofOfDeliveryManageService.getByOrderId(order.id)
                .then(function(pod) {
                    $state.go('openlmis.orders.podManage.podView', {
                        podId: pod.id
                    });
                })
                .catch(function() {
                    notificationService.error('transferOverview.podNotFound');
                    loadingModalService.close();
                });
        }

        function getAction(order) {
            if (!vm.incoming) {
                return getOutgoingAction(order);
            }
            return order.type === ORDER_TYPE.TRANSFER_REQUEST
                ? getIncomingRequestAction(order)
                : getReceiptAction(order);
        }

        function getOutgoingAction(order) {
            var status = order.status;

            if (order.type === ORDER_TYPE.TRANSFER_REQUEST && rights.canFulfil) {
                if (status === ORDER_STATUS.ORDERED) {
                    return shipment(order, 'transferOverview.fulfil', 'primary');
                }
                if (status === ORDER_STATUS.FULFILLING) {
                    return shipment(order, 'transferOverview.continueFulfilment', 'primary');
                }
            }
            if ((status === ORDER_STATUS.SHIPPED || status === ORDER_STATUS.RECEIVED) && rights.canViewShipments) {
                return shipment(order, 'transferOverview.viewShipment', 'secondary');
            }
            return undefined;
        }

        function getIncomingRequestAction(order) {
            if (order.status === 'CREATING') {
                return rights.canRequest ? edit(order) : undefined;
            }
            if (order.status === ORDER_STATUS.ORDERED || order.status === ORDER_STATUS.FULFILLING) {
                return text('transferOverview.waitingForSupplier');
            }
            return getReceiptAction(order);
        }

        function getReceiptAction(order) {
            if (order.status === ORDER_STATUS.SHIPPED && canManagePod(order)) {
                return pod('transferOverview.receive', 'primary');
            }
            if ((order.status === ORDER_STATUS.SHIPPED || order.status === ORDER_STATUS.RECEIVED) &&
                rights.canViewPods) {
                return pod('transferOverview.view', 'secondary');
            }
            return undefined;
        }

        function canManagePod(order) {
            return rights.podManagePrograms.indexOf(order.program.id) > -1;
        }

        function edit(order) {
            return {
                label: 'transferOverview.edit',
                kind: 'primary',
                state: 'openlmis.stockmanagement.transferRequest.table',
                params: {
                    programId: order.program.id,
                    orderId: order.id
                }
            };
        }

        function shipment(order, label, kind) {
            return {
                label: label,
                kind: kind,
                state: 'openlmis.orders.shipmentView',
                params: {
                    id: order.id
                }
            };
        }

        function pod(label, kind) {
            return {
                label: label,
                kind: kind,
                pod: true
            };
        }

        function text(label) {
            return {
                label: label,
                kind: 'text'
            };
        }

        // the supplier never sees drafts
        function getStatuses(incoming) {
            return TRANSFER_OVERVIEW.STATUSES.filter(function(status) {
                return incoming || status !== TRANSFER_OVERVIEW.STATUS_CREATING;
            });
        }

        function isStatusOf(incoming, status) {
            return status === TRANSFER_OVERVIEW.STATUS_OPEN || status === TRANSFER_OVERVIEW.STATUS_ALL ||
                getStatuses(incoming).indexOf(status) > -1;
        }

        function getStatusOptions() {
            var statuses = getStatuses(vm.incoming);

            return [
                {
                    value: TRANSFER_OVERVIEW.STATUS_OPEN,
                    name: messageService.get('transferOverview.status.open')
                },
                {
                    value: TRANSFER_OVERVIEW.STATUS_ALL,
                    name: messageService.get('transferOverview.status.all')
                }
            ].concat(statuses.map(toOption('orderStatus.')));
        }

        function toOption(messagePrefix) {
            return function(value) {
                return {
                    value: value,
                    name: messageService.get(messagePrefix + value)
                };
            };
        }

        function findById(items, id) {
            return items.filter(function(item) {
                return item.id === id;
            })[0];
        }
    }
})();
