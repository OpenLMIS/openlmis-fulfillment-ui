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

describe('transferService', function() {

    var transferService, $rootScope, $httpBackend, fulfillmentUrlFactory, order;

    beforeEach(function() {
        module('transfer');

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $httpBackend = $injector.get('$httpBackend');
            transferService = $injector.get('transferService');
            fulfillmentUrlFactory = $injector.get('fulfillmentUrlFactory');
        });

        order = {
            id: 'order-id',
            program: {
                id: 'program-id'
            },
            requestingFacility: {
                id: 'facility-id'
            },
            supplyingFacility: {
                id: 'supplier-id'
            },
            facility: {
                id: 'facility-id'
            },
            orderLineItems: []
        };
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('getPartners', function() {

        var partnersUrl = '/api/transfers/partners?direction=REQUEST&facilityId=facility-id&programId=program-id';

        it('should return the partners of the facility in the given direction', function() {
            var partners = [{
                id: 'partner-id',
                name: 'Partner'
            }];
            $httpBackend.expectGET(fulfillmentUrlFactory(partnersUrl)).respond(200, partners);

            var result;
            transferService.getPartners('facility-id', 'program-id', 'REQUEST')
                .then(function(response) {
                    result = response;
                });
            $httpBackend.flush();
            $rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson(partners));
        });

        it('should reject with the response if the user has no right for the facility', function() {
            $httpBackend.expectGET(fulfillmentUrlFactory(partnersUrl)).respond(403, {
                message: 'Missing permission'
            });

            var rejection;
            transferService.getPartners('facility-id', 'program-id', 'REQUEST')
                .catch(function(response) {
                    rejection = response;
                });
            $httpBackend.flush();
            $rootScope.$apply();

            expect(rejection.status).toEqual(403);
            expect(rejection.data.message).toEqual('Missing permission');
        });
    });

    describe('createRequest', function() {

        it('should post the order to /api/transfers/requests and return the created order', function() {
            $httpBackend.expectPOST(fulfillmentUrlFactory('/api/transfers/requests'), order)
                .respond(201, angular.extend({}, order, {
                    status: 'CREATING'
                }));

            var result;
            transferService.createRequest(order)
                .then(function(response) {
                    result = response;
                });
            $httpBackend.flush();
            $rootScope.$apply();

            expect(result.id).toEqual('order-id');
            expect(result.status).toEqual('CREATING');
        });

        it('should reject with the response on a validation error', function() {
            $httpBackend.expectPOST(fulfillmentUrlFactory('/api/transfers/requests'), order)
                .respond(400, {
                    message: 'Not a transfer partner'
                });

            var rejection;
            transferService.createRequest(order)
                .catch(function(response) {
                    rejection = response;
                });
            $httpBackend.flush();
            $rootScope.$apply();

            expect(rejection.data.message).toEqual('Not a transfer partner');
        });
    });

    describe('updateRequest', function() {

        it('should put the order to /api/transfers/requests/{id}', function() {
            $httpBackend.expectPUT(fulfillmentUrlFactory('/api/transfers/requests/order-id'), order)
                .respond(200, order);

            var result;
            transferService.updateRequest(order)
                .then(function(response) {
                    result = response;
                });
            $httpBackend.flush();
            $rootScope.$apply();

            expect(result.id).toEqual('order-id');
        });
    });

    describe('sendRequest', function() {

        it('should put the order to /api/transfers/requests/{id}/send', function() {
            $httpBackend.expectPUT(fulfillmentUrlFactory('/api/transfers/requests/order-id/send'), order)
                .respond(200);

            var resolved = false;
            transferService.sendRequest(order)
                .then(function() {
                    resolved = true;
                });
            $httpBackend.flush();
            $rootScope.$apply();

            expect(resolved).toBe(true);
        });

        it('should reject with the response on a validation error', function() {
            $httpBackend.expectPUT(fulfillmentUrlFactory('/api/transfers/requests/order-id/send'), order)
                .respond(400, {
                    message: 'Quantity required'
                });

            var rejection;
            transferService.sendRequest(order)
                .catch(function(response) {
                    rejection = response;
                });
            $httpBackend.flush();
            $rootScope.$apply();

            expect(rejection.data.message).toEqual('Quantity required');
        });
    });

    describe('deleteRequest', function() {

        it('should delete the request through /api/orders', function() {
            $httpBackend.expect('DELETE', fulfillmentUrlFactory('/api/orders'), {
                ids: ['order-id']
            }).respond(204);

            var resolved = false;
            transferService.deleteRequest('order-id')
                .then(function() {
                    resolved = true;
                });
            $httpBackend.flush();
            $rootScope.$apply();

            expect(resolved).toBe(true);
        });
    });
});
