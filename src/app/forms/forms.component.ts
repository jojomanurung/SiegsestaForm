import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { defer, from, Subscription } from 'rxjs';
import { FormsService } from './forms.service';
import { KelasPerlombaan } from './kelas-perlombaan.model';
import { Pendaftaran } from './pendaftaran.model';
import { SelectionModel } from '@angular/cdk/collections';
import * as JsBarcode from 'jsbarcode';
import * as moment from 'moment';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.css'],
})
export class FormsComponent implements OnInit, OnDestroy {
  @ViewChild('noooohhh') noooohhh!: ElementRef;

  pendaftaranForm!: FormGroup;
  kelasPerlombaan!: KelasPerlombaan[];
  subs!: Subscription;

  selection = new SelectionModel<string>(true, []);

  constructor(private fs: FormsService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initPendaftaranForm();
    this.fetchKelas();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  initPendaftaranForm() {
    this.pendaftaranForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      placeOfBirth: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      nik: ['', Validators.required],
      phone: ['', [Validators.required, Validators.minLength(11)]],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/),
        ],
      ],
      city: ['', Validators.required],
      team: ['', Validators.required],
      class: [null, Validators.required],
    });
  }

  fetchKelas() {
    this.subs = this.fs.getKelasPerlombaan().subscribe((resp) => {
      this.kelasPerlombaan = resp;
    });
  }

  keyPress(event: KeyboardEvent) {
    const pattern = /[0-9\+\-\ ]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  checkbox(value: string) {
    this.selection.toggle(value);
    this.form('class').patchValue(this.selection.selected);
  }

  form(name: string) {
    return this.pendaftaranForm.controls[name];
  }

  submit() {
    const isFormValid = this.pendaftaranForm.valid;
    if (!isFormValid) {
      this.pendaftaranForm.markAllAsTouched();
      return;
    }
    const formVal = this.pendaftaranForm.value as Pendaftaran;
    formVal.dateOfBirth = moment(formVal.dateOfBirth).format('DD/MM/YYYY');
    this.subs = defer(() => from(this.fs.submitPendaftaran(formVal))).subscribe(
      (resp) => {
        const id = resp;
        JsBarcode(this.noooohhh.nativeElement, id);
        // const base64Img = (this.noooohhh.nativeElement as HTMLImageElement).src;

        // fetch(base64Img)
        //   .then((res) => res.blob())
        //   .then((blob) => {
        //     this.subs = defer(() =>
        //       from(this.fs.uploadBarcode(blob, id))
        //     ).subscribe((resp) => {
        //       const email = this.form('email').value;

        //       this.subs = defer(() =>
        //         from(this.fs.sendEmailPendaftaran(email, resp))
        //       ).subscribe();
        //     });
        //   });
      }
    );
  }
}
