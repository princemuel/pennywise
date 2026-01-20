import { range } from "@/helpers/range";

export default function Page() {
  return (
    <>
      <h1 id="a11ty-headline">Transactions</h1>

      {[...range(50)].map((i) => (
        <p key={i}>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Non iste nulla suscipit hic.
          Officiis corporis a quam alias, tenetur exercitationem, aut, tempora nihil ex nobis iste
          sint necessitatibus consectetur cupiditate totam cumque! Molestiae quos totam ad, quidem
          maxime exercitationem expedita illo, est itaque doloremque sequi corporis voluptatibus!
          Dolore, reiciendis blanditiis.
        </p>
      ))}
    </>
  );
}
