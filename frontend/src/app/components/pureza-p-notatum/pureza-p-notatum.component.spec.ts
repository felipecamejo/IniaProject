import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurezaPNotatumComponent } from './pureza-p-notatum.component';

describe('PurezaPNotatumComponent', () => {
  let component: PurezaPNotatumComponent;
  let fixture: ComponentFixture<PurezaPNotatumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurezaPNotatumComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurezaPNotatumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
