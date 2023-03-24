import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FormsService } from './forms.service';
import { KelasPerlombaan } from './kelas-perlombaan.model';
import { Pendaftaran } from './pendaftaran.model';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.css']
})
export class FormsComponent implements OnInit {

  pendaftaranForm!: FormGroup;
  kelasPerlombaan!: KelasPerlombaan[];
  subs!: Subscription

  selection = new SelectionModel<string>(true, []);

  constructor(private fs: FormsService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initPendaftaranForm();
    this.fetchKelas();
  }

  initPendaftaranForm() {
    this.pendaftaranForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        placeOfBirth: ['', Validators.required],
        dateOfBirth: ['', Validators.required],
        nik: ['', Validators.required],
        phone: ['', Validators.required],
        email: ['', Validators.required],
        city: ['', Validators.required],
        team: ['', Validators.required],
        class: [null],
      }
    )
  }

  fetchKelas() {
    this.subs = this.fs.getKelasPerlombaan().subscribe((resp) => {
      this.kelasPerlombaan = resp;
    })
  }

  submit() {
    console.log('Submit');
    const isFormValid = this.pendaftaranForm.valid;
    if (!isFormValid) {
      this.pendaftaranForm.markAllAsTouched();
      return
    }
    const formVal = this.pendaftaranForm.value as Pendaftaran;
    formVal.class = this.selection.selected
    console.log('formVal', formVal);
    // this.fs.submitPendaftaran(formVal)
  }

  checks($event:any) {
    console.log($event);
  }
}
