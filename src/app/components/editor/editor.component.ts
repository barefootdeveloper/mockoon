import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import 'brace';
import 'brace/ext/searchbox';
import 'brace/index';
import 'brace/mode/css';
import 'brace/mode/html.js';
import 'brace/mode/json.js';
import 'brace/mode/text.js';
import 'brace/mode/xml.js';
import '../../../assets/editor-theme.js';

declare const ace: any;

/**
 * Ace editor component taken from
 * https://github.com/fxmontigny/ng2-ace-editor
 */
@Component({
  selector: 'app-editor',
  template: '',
  styles: [':host { display:block; width:100%; height:100%; }'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: forwardRef(() => EditorComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorComponent
  implements ControlValueAccessor, OnInit, OnDestroy {
  @Output()
  public textChanged = new EventEmitter();
  @Output()
  public textChange = new EventEmitter();
  @Input()
  public style = {};
  public oldText: any;
  public timeoutSaving: any;
  private _options = {};
  private _readOnly = false;
  private _theme = 'editor-theme';
  private _mode = 'html';
  private _autoUpdateContent = true;
  private _editor: any;
  private _durationBeforeCallback = 0;
  private _text = '';

  constructor(elementRef: ElementRef, private zone: NgZone) {
    const element = elementRef.nativeElement;
    this.zone.runOutsideAngular(() => {
      this._editor = ace['edit'](element);
    });
    this._editor.$blockScrolling = Infinity;
  }

  public get value() {
    return this.text;
  }

  public get text() {
    return this._text;
  }

  @Input()
  public set value(value: string) {
    this.setText(value);
  }

  @Input()
  public set options(options: any) {
    this.setOptions(options);
  }

  @Input()
  public set theme(theme: any) {
    this.setTheme(theme);
  }

  @Input()
  public set mode(mode: any) {
    this.setMode(mode);
  }

  @Input()
  public set readOnly(readOnly: any) {
    this.setReadOnly(readOnly);
  }

  @Input()
  public set text(text: string) {
    this.setText(text);
  }

  @Input()
  public set autoUpdateContent(status: any) {
    this.setAutoUpdateContent(status);
  }

  @Input()
  public set durationBeforeCallback(num: number) {
    this.setDurationBeforeCallback(num);
  }

  ngOnInit() {
    this.init();
    this.initEvents();
  }

  ngOnDestroy() {
    this._editor.destroy();
  }

  public onChange = (_: any) => {};

  public registerOnChange(fn: any) {
    this.onChange = fn;
  }

  public onTouched = () => {};

  public registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  public writeValue(value: any) {
    this.setText(value);
  }

  private init() {
    this.setOptions(this._options || {});
    this.setTheme(this._theme);
    this.setMode(this._mode);
    this.setReadOnly(this._readOnly);
  }

  private initEvents() {
    this._editor.on('change', () => this.updateText());
    this._editor.on('paste', () => this.updateText());
  }

  private updateText() {
    const newVal = this._editor.getValue();

    if (newVal === this.oldText) {
      return;
    }

    if (!this._durationBeforeCallback) {
      this._text = newVal;
      this.zone.run(() => {
        this.textChange.emit(newVal);
        this.textChanged.emit(newVal);
      });
      this.onChange(newVal);
    } else {
      if (this.timeoutSaving) {
        clearTimeout(this.timeoutSaving);
      }

      this.timeoutSaving = setTimeout(() => {
        this._text = newVal;
        this.zone.run(() => {
          this.textChange.emit(newVal);
          this.textChanged.emit(newVal);
        });
        this.timeoutSaving = null;
      }, this._durationBeforeCallback);
    }
    this.oldText = newVal;
  }

  private setOptions(options: any) {
    this._options = options;
    this._editor.setOptions(options || {});
  }

  private setReadOnly(readOnly: any) {
    this._readOnly = readOnly;
    this._editor.setReadOnly(readOnly);
  }

  private setTheme(theme: any) {
    this._theme = theme;
    this._editor.setTheme(`ace/theme/${theme}`);
  }

  private setMode(mode: any) {
    this._mode = mode;
    if (typeof this._mode === 'object') {
      this._editor.getSession().setMode(this._mode);
    } else {
      this._editor.getSession().setMode(`ace/mode/${this._mode}`);
    }
  }

  private setText(text: any) {
    if (text === null || text === undefined) {
      text = '';
    }
    if (this._text !== text && this._autoUpdateContent === true) {
      this._text = text;
      this._editor.setValue(text);
      this.onChange(text);
      this._editor.clearSelection();
    }
  }

  private setAutoUpdateContent(status: any) {
    this._autoUpdateContent = status;
  }

  private setDurationBeforeCallback(num: number) {
    this._durationBeforeCallback = num;
  }

  private getEditor() {
    return this._editor;
  }
}
