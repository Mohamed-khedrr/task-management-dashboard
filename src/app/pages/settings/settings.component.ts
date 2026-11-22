import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { LanguageService } from '../../core/i18n/language.service';
import { AppLanguage, LANGUAGE_OPTIONS } from '../../core/models/language.model';
import { ProfileService } from '../../core/services/profile.service';
import { requiredText } from '../../shared/validators/form.validators';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, TranslocoPipe, ButtonModule, InputTextModule, SelectButtonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly profile = inject(ProfileService);
  private readonly language = inject(LanguageService);
  private readonly messages = inject(MessageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly languageOptions = LANGUAGE_OPTIONS;

  protected readonly form = this.formBuilder.group({
    name: [this.profile.name(), requiredText],
    language: this.formBuilder.control<AppLanguage>(this.language.activeLang()),
  });

  protected showNameError() {
    const name = this.form.controls.name;
    return name.invalid && name.touched;
  }

  protected save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, language } = this.form.getRawValue();
    this.profile.setName(name);
    this.language.setLanguage(language);

    this.messages.add({
      severity: 'success',
      summary: this.transloco.translate('settings.saved', {}, language),
    });
  }
}
