import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoteAnalisisComponent } from './lote-analisis.component';

describe('LoteAnalisisComponent', () => {
  let component: LoteAnalisisComponent;
  let fixture: ComponentFixture<LoteAnalisisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoteAnalisisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoteAnalisisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
