import {
  AfterViewInit,
  Directive,
  DoCheck,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Self,
} from '@angular/core';
import { NgControl, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

/**
 * Type describing the allowed values for a boolean input.
 * @docs-private
 */
export type BooleanInput = string | boolean | null | undefined;

/** Coerces a data-bound value (typically a string) to a boolean. */
export function coerceBooleanProperty(value: any): boolean {
  return value != null && `${value}` !== 'false';
}

// Invalid input type. Using one of these will throw an MatInputUnsupportedTypeError.
const MAT_INPUT_INVALID_TYPES = [
  'button',
  'checkbox',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
];

export function getMatInputUnsupportedTypeError(type: string): Error {
  return Error(`Input type "${type}" isn't supported.`);
}

@Directive({
  selector: 'input[siegInput], textarea[siegInput]',
  host: {
    class:
      'border border-blueGray-300 p-4 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150',
    // Native input properties that are overwritten by Angular inputs need to be synced with
    // the native input element. Otherwise property bindings for those don't work.
    '[class.ring]': '_control?.invalid && _control?.touched',
    '[class.ring-red-400]': '_control?.invalid && _control?.touched',
    '[class.cursor-not-allowed]': '_control?.disabled',
    '[id]': 'id',
    '[disabled]': 'disabled',
    '[required]': 'required',
    '[attr.name]': 'name || null',
    '[attr.readonly]': 'readonly || null',
    '[attr.aria-required]': 'required',
    // Native input properties that are overwritten by Angular inputs need to be synced with
    // the native input element. Otherwise property bindings for those don't work.
    '[attr.id]': 'id',
    '(focus)': '_focusChanged(true)',
    '(blur)': '_focusChanged(false)',
    '(input)': '_onInput()',
  },
})
export class SiegInputDirective
  implements OnChanges, OnDestroy, AfterViewInit, DoCheck
{
  protected _previousNativeValue: any;
  private _inputValueAccessor!: { value: any };
  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  focused: boolean = false;

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  stateChanges: Subject<void> = new Subject<void>();

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);

    // Browsers may not fire the blur event if the input is disabled too quickly.
    // Reset from here to ensure that the element doesn't become stuck.
    if (this.focused) {
      this.focused = false;
      this.stateChanges.next();
    }
  }
  protected _disabled = false;

  @Input()
  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value;
  }
  protected _id!: string;

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  @Input() placeholder!: string;

  /**
   * Name of the input.
   * @docs-private
   */
  @Input() name!: string;

  @Input()
  get required(): boolean {
    return (
      this._required ??
      this.ngControl?.control?.hasValidator(Validators.required) ??
      false
    );
  }
  set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
  }
  protected _required: boolean | undefined;

  /** Input type of the element. */
  @Input()
  get type(): string {
    return this._type;
  }
  set type(value: string) {
    this._type = value || 'text';
    this._validateType();
  }
  protected _type = 'text';

  @Input()
  get value(): string {
    return this._inputValueAccessor.value;
  }
  set value(value: any) {
    if (value !== this.value) {
      this._inputValueAccessor.value = value;
      this.stateChanges.next();
    }
  }

  /** Whether the element is readonly. */
  @Input()
  get readonly(): boolean {
    return this._readonly;
  }
  set readonly(value: BooleanInput) {
    this._readonly = coerceBooleanProperty(value);
  }
  private _readonly = false;

  get _control() {
    // TODO(crisbeto): we need this workaround in order to support both Ivy and ViewEngine.
    //  We should clean this up once Ivy is the default renderer.
    return this.ngControl?.control;
  }

  constructor(
    protected _elementRef: ElementRef<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    public ngControl: NgControl,
    @Optional() @Self() @Inject(NG_VALUE_ACCESSOR) inputValueAccessor: any
  ) {
    const element = this._elementRef.nativeElement;
    // If no input value accessor was explicitly specified, use the element as the input value
    // accessor.
    this._inputValueAccessor = inputValueAccessor || element;

    this._previousNativeValue = this.value;

    // Force setter to be called in case id was not specified.
    this.id = this.id;
  }

  ngAfterViewInit() {
    this.stateChanges.next();
  }

  ngOnChanges() {
    this.stateChanges.next();
  }

  ngOnDestroy() {
    this.stateChanges.complete();
  }

  ngDoCheck() {
    if (this.ngControl) {
      // Since the input isn't a `ControlValueAccessor`, we don't have a good way of knowing when
      // the disabled state has changed. We can't use the `ngControl.statusChanges`, because it
      // won't fire if the input is disabled with `emitEvents = false`, despite the input becoming
      // disabled.
      if (
        this.ngControl.disabled !== null &&
        this.ngControl.disabled !== this.disabled
      ) {
        this.disabled = this.ngControl.disabled;
        this.stateChanges.next();
      }
    }

    // We need to dirty-check the native element's value, because there are some cases where
    // we won't be notified when it changes (e.g. the consumer isn't using forms or they're
    // updating the value using `emitEvent: false`).
    this._dirtyCheckNativeValue();
  }

  /** Focuses the input. */
  focus(options?: FocusOptions): void {
    this._elementRef.nativeElement.focus(options);
  }

  /** Callback for the cases where the focused state of the input changes. */
  _focusChanged(isFocused: boolean) {
    if (isFocused !== this.focused) {
      this.focused = isFocused;
      this.stateChanges.next();
    }
  }

  _onInput() {
    // This is a noop function and is used to let Angular know whenever the value changes.
    // Angular will run a new change detection each time the `input` event has been dispatched.
    // It's necessary that Angular recognizes the value change, because when floatingLabel
    // is set to false and Angular forms aren't used, the placeholder won't recognize the
    // value changes and will not disappear.
    // Listening to the input event wouldn't be necessary when the input is using the
    // FormsModule or ReactiveFormsModule, because Angular forms also listens to input events.
  }

  /** Does some manual dirty checking on the native input `value` property. */
  protected _dirtyCheckNativeValue() {
    const newValue = this._elementRef.nativeElement.value;

    if (this._previousNativeValue !== newValue) {
      this._previousNativeValue = newValue;
      this.stateChanges.next();
    }
  }

  /** Make sure the input is a supported type. */
  protected _validateType() {
    if (
      MAT_INPUT_INVALID_TYPES.indexOf(this._type) > -1
    ) {
      throw getMatInputUnsupportedTypeError(this._type);
    }
  }

}
