import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { getTranslocoModule } from '../../../testing/transloco-testing';
import { SearchService } from '../../core/services/search.service';
import { ProfileService } from '../../core/services/profile.service';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, getTranslocoModule()],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    await fixture.whenStable();
  });

  it('emits menuToggle when the menu button is clicked', () => {
    const onMenuToggle = vi.fn();
    fixture.componentInstance.menuToggle.subscribe(onMenuToggle);

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.menu-button')!
      .click();

    expect(onMenuToggle).toHaveBeenCalledOnce();
  });

  it('shows the search only on pages that have one, and passes on what the user types', async () => {
    const search = TestBed.inject(SearchService);
    const input = () =>
      (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('.search-input');

    expect(input()).toBeNull();

    search.scope.set('team');
    await fixture.whenStable();
    input()!.value = 'sarah';
    input()!.dispatchEvent(new Event('input'));

    expect(search.text()).toBe('sarah');
  });

  it('shows the initials of the saved name in the avatar', async () => {
    TestBed.inject(ProfileService).setName('Mohamed Ali Khedr');
    await fixture.whenStable();

    const avatar = (fixture.nativeElement as HTMLElement).querySelector('.avatar')!;
    expect(avatar.textContent?.trim()).toBe('MK');
  });
});
