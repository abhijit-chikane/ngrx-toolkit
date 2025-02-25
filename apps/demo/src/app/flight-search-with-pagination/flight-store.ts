import { FlightService } from '../shared/flight.service';
import { patchState, signalStore, type, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import {
  withCallState,
  withDataService,
  withPagination,
  setPageSize,
  gotoPage,
} from '@angular-architects/ngrx-toolkit';
import { Flight } from '../shared/flight';

// Name of the collection
const collectionName = 'flight';

export const FlightBookingStore = signalStore(
  withCallState({
    collection: collectionName,
  }),
  withEntities({
    entity: type<Flight>(),
    collection: collectionName,
  }),
  withDataService({
    dataServiceType: FlightService,
    filter: { from: 'Wien', to: '' },
    collection: collectionName,
  }),
  withPagination({
    entity: type<Flight>(),
    collection: collectionName,
  }),
  withMethods((store) => ({
    setFlightPageSize: (size: number) => {
      patchState(store, setPageSize(size, { collection: collectionName }));
    },
    gotoFlightPage: (page: number) => {
      patchState(store, gotoPage(page, { collection: collectionName }));
    },
  }))
);
