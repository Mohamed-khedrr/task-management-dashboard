import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartLegendComponent } from './chart-legend.component';

describe('ChartLegendComponent', () => {
  let fixture: ComponentFixture<ChartLegendComponent>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(ChartLegendComponent);
    fixture.componentRef.setInput('items', [
      { label: 'To Do', count: 4, color: '#1976d2' },
      { label: 'Done', count: 9, color: '#388e3c' },
    ]);
    await fixture.whenStable();
  });

  it('shows one entry per item with its count', () => {
    const counts = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.count'),
      (count) => count.textContent,
    );

    expect(counts).toEqual(['4', '9']);
  });
});
