function Fasta(id){

	let genbankID = id;
	console.log(genbankID);

	fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=${genbankID}&rettype=fasta&retmode=text`)
    .then(function(response) {
        if (response.status >= 400) {
            throw new Error("Bad response from server");
        }
        return response.text();
    })
    .then(function(fasta) {
    	let detailsNode = document.getElementById('hexDetails');
    	const markup = `
        <h5>
          ${ fasta.split(',')[0] }</span>
        </h5>
        `;

      detailsNode.innerHTML = markup;

        // console.log(fasta);
    });
}

export default Fasta;