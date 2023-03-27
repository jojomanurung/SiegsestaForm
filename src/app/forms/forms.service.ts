import { Injectable } from '@angular/core';

import {
  addDoc,
  collection,
  collectionSnapshots,
  Firestore,
} from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { KelasPerlombaan } from './kelas-perlombaan.model';
import { Pendaftaran } from './pendaftaran.model';

@Injectable({
  providedIn: 'root'
})
export class FormsService {
  kelasRef = collection(this.store, 'kelas_perlombaan');
  pendaftaranRef = collection(this.store, 'pendaftaran');

  constructor(private store: Firestore) { }

  getKelasPerlombaan() {
    return collectionSnapshots(this.kelasRef).pipe(
      map((docs) => {
        return docs.map((doc) => {
          const data = doc.data() as KelasPerlombaan;
          data.id = doc.id;
          return data;
        });
      })
    );
  }

  async submitPendaftaran(form: Pendaftaran) {
    // const payload = form;
    // console.log(payload);

    // const docRef = await addDoc(this.pendaftaranRef, payload);
    // return docRef.id;
    return 'GtIcVxLqVmsJgxhwH5Nk'
  }

}
