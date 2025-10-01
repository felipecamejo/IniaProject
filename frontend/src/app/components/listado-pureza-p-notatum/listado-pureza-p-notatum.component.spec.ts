import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoPurezaPNotatumComponent } from './listado-pureza-p-notatum.component';

describe('ListadoPurezaPNotatumComponent', () => {
  let component: ListadoPurezaPNotatumComponent;
  let fixture: ComponentFixture<ListadoPurezaPNotatumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoPurezaPNotatumComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoPurezaPNotatumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
