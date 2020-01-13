var dados = [];
var dados2 = [];
var amostra;
var tecAmos;
var procEst;
var tamanho;
var tVar;
var vPesq = [];
var freq = [];
var fRel = [];
var fAcum = [];
var fAcPer = [];
function principal(){
	dados = pegarDados(); //Recebe os dados digitados e validados.
	tVar = tipoVar();
	procEst = procEstatistico() //Define o tipo de processo( Censo ou estimação )
	if( procEst == "estimacao" ) //Caso seja estimação então devemos verificar qual a técnica de amostragem.
		tecAmos = tecAmostragem();
	

	
	if(dados != "finalizar" ){
		if( tecAmos == "estratificada"){
			dados2 = pegarDados2();	
		}else{
			dados2 = [];
		}
		
		if( dados2 != "finalizar" ){
			amostra = definirAmostra(); //Obtém a amostra que será usada para os cálculos.
			tamanho = dados.length + dados2.length;
			amostra = organizarDados()
			//alert(procEst);
			//alert(tecAmos);
			//alert(tamanho);
			//alert(tVar);
			
			vPesq = varPesq();
			freq = freqSimples();
			fRel = freqRel();
			fAcum = freqAcumulada();
			fAcPer = freqAcPercentual();
			
			gerarTabela(vPesq,freq,fRel,fAcum,fAcPer); //Geramos a tabela no document HTML
			
			if(tVar == "quantContinua"){
				ic = parseInt(interClasse()); //Aqui retorna o intervalo de classe.
				media = obterMedia(vPesq,freq,tVar);
				mediana = obterMediana(amostra,ic,freq,fAcum); //Obtemos a mediana
				modaConvencional = obterModaConvencional(vPesq,freq,tVar);
				mPearson = modaPearson(mediana,media);
				mKing = modaKing(freq,amostra,ic);
				mCzuber = modaCzuber(freq,amostra,ic);

			}else{
				media = obterMedia(vPesq,freq,tVar);
				mediana = medianaOutros(amostra,freq);
				modaConvencional = obterModaConvencional(vPesq,freq,tVar);

			}
			
			dPadrao = desvioPadrao(vPesq,freq,media,procEst); //Obtemos o desvio padrão.
			cVarianca = coefVarianca(dPadrao,media); //Obtemos o coeficiente de variança
			
			
			outrosDados(media,mediana,modaConvencional,mPearson,mKing,mCzuber,tVar,dPadrao,cVarianca); //Geramos(media, moda, mediana, desvio padrão....) no documento HTML.
		
			gerarGraficos(vPesq,freq);
		}
		
	}
}

//Função que gera os dados calculados no documento HTML
function outrosDados(media,mediana,modaConvencional,mPearson,mKing,mCzuber,tipo,dPadrao,cVar){
	media = media.toFixed(2);
	dPadrao = dPadrao.toFixed(2);
	cVar = cVar.toFixed(2);
	  if(tipo=="quantContinua"){
		document.getElementById("media").innerHTML = media;
		document.getElementById("mediana").innerHTML = mediana;
		document.getElementById("modaConvencional").innerHTML = modaConvencional;
		document.getElementById("mPearson").innerHTML = mPearson;
		document.getElementById("mKing").innerHTML = mKing;
		document.getElementById("mCzuber").innerHTML = mCzuber;
		document.getElementById("dPadrao").innerHTML = dPadrao;
		document.getElementById("cVar").innerHTML = cVar + "%";
	  }else{
		document.getElementById("media").innerHTML = media;
		document.getElementById("mediana").innerHTML = mediana;
		document.getElementById("modaConvencional").innerHTML = modaConvencional;
		document.getElementById("dPadrao").innerHTML = dPadrao;
		document.getElementById("cVar").innerHTML = cVar + "%";
	  }

}

//Função que retorna o coeficiente de variança
function coefVarianca(dPadrao,media){
  coefVar = dPadrao / media * 100;
  return coefVar;
}

//Função que calcula o desvio padrão.
function desvioPadrao(amostra,fSimples,media,proc_est){
  var somatorioFi = somFi(fSimples);
  var med = 0;

  for(i in amostra){
    med += Math.pow(parseFloat(amostra[i]) - parseFloat(media),2) * fSimples[i];
  }

  if(proc_est == "censo"){
    varianca = med / somatorioFi;

  }else if(proc_est == "estimacao"){
    varianca = med / (somatorioFi - 1);
  }
  desPadrao = Math.sqrt(varianca);

  return desPadrao;
}



//Obtém moda de Czuber caso seja Quant. Contínua.
function modaCzuber(fi,amostra,ic){
  classeModal = classeModalContinua(fi);
  limInferior = limInferiorContinua(amostra,classeModal+1,ic);

  if(classeModal == 0){
	fiPost = fi[classeModal + 1];
	fiAnt = 0;
  }else if(classeModal == (fi.length - 1)){
	fiPost = 0
	fiAnt = fi[classeModal - 1];  
  }else{
	fiPost = fi[classeModal + 1];
	fiAnt =  fi[classeModal - 1]; //E se a classe modal for a primeira. Como calcula o Fi Anterior.
  }
  
  fimd = fi[classeModal];
  
  mCzuber = limInferior + (fimd - fiAnt) / (2 * fimd - (fiAnt + fiPost)) * ic;

  return mCzuber;
}

//Obtém moda de King caso seja Quant. Contínua.
function modaKing(fi,amostra,ic){
  classeModal = classeModalContinua(fi);

  limInferior = limInferiorContinua(amostra,classeModal+1,ic);
  if(classeModal == 0){
	fiPost = fi[classeModal + 1];
	fiAnt = 0;
  }else if(classeModal == (fi.length - 1)){
	fiPost = 0
	fiAnt = fi[classeModal - 1];  
  }else{
	fiPost = fi[classeModal + 1];
	fiAnt =  fi[classeModal - 1]; //E se a classe modal for a primeira. Como calcula o Fi Anterior.
  }
  
  modaKing = limInferior + (fiPost) / (fiAnt + fiPost) * ic;

  return modaKing;
}


//Encontra o limite infeiror. Só é chamada na Quant.contínua.
function limInferiorContinua(amostra,classeModal,ic){
  var limInferior = parseFloat(amostra[0]);
  for(var i = 1; i < classeModal; i++){
    limInferior += parseInt(ic);
  }
  return limInferior;
}

//Obtém moda de pearson caso seja Quant. Contínua.
function modaPearson(md,media){
  mPearson = 3 * md - 2 * media;
  return mPearson;
}

//Obter moda convencional
function obterModaConvencional(varPesq,fi,tipo){
  if(tipo == "quantContinua"){
    xi = pontoMedio(varPesq);
    classeModa = classeModalContinua(fi)
    modaConven = xi[classeModa];
  }else{
    maiorFreq = fi[0];
    modaConven = varPesq[0];
    for(i in fi){
      if(fi[i] > maiorFreq){
        modaConven = varPesq[i];
        maiorFreq = fi[i]
      }
    }
  }
  return modaConven;
}

//Obtém classe modal. Usado em outros cálculos.
function classeModalContinua(fi){
  maior = fi[0];
  classeModa = 0
  //Encontrar a classe da moda. O elemento de maior frequencia(fi)
  for(var i = 1; i < fi.length; i++){
    if(fi[i] > maior){
      classeModa = i ;
    }
  }
  return classeModa;
}

//Função que encontra a mediana da quantDiscreta.
function medianaOutros(amostra,fi){

  somatorioFi = somFi(fi);

  if(somatorioFi % 2 == 0){
    mediana = (parseFloat(amostra[ somatorioFi/2 - 1 ]) + parseFloat(amostra[ somatorioFi/2 ])  ) / 2;
  }else{
    mediana = parseFloat(amostra[ parseInt(somatorioFi / 2) ])
  }
  return mediana;
}

//Obtem mediana
function obterMediana(amostra,ic,fi,fac){
    //Obter a classe da mediana.
    var classeMediana;
    var posicaoMediana = parseFloat(somFi(fi) / 2);
    for(var i = 0; i < fac.length; i++){
      if(fac[i] >= posicaoMediana){
        classeMediana = i;
        break;
      }
    }
	
	if(classeMediana == 0){
		fant = 0;
	}else{
		fant = fac[classeMediana - 1];
	}
	
    var limInferior = parseFloat(amostra[0]);

	for(var i = 1; i < classeMediana; i++){
		limInferior += parseInt(ic);
	}

    mediana = limInferior + (posicaoMediana - fant) / (fi[classeMediana]) * ic;


  return mediana;
}


//Obtem média
function obterMedia(xi,fi,tipo){
  var media = [];

  if(tipo == "quantContinua"){
    xi = pontoMedio(xi);
  }

  var somatorioXiFi = somXiFi(xi,fi);
  var somatorioFi = somFi(fi);

  media = somatorioXiFi / somatorioFi;

  return media;
}

//Obtem ponto médio
function pontoMedio(xi){
  var intervalo = [];
  for(i in xi){
    pntMedio = (parseInt(xi[i].split(" - ")[0]) + parseInt(xi[i].split(" - ")[1])) / 2.0;
    intervalo.push(pntMedio);
  }
  return intervalo;
}

//Retorna o somatorio de Xi * Fi (freqSimples * varPesquisada);
function somXiFi(xi,fi){
  somaXiFi = 0;

  for(i in fi){
    somaXiFi += parseInt(xi[i]) * parseInt(fi[i]);
  }
  return somaXiFi;
}

//Retorna o somatório de Fi(freqSimples)
function somFi(fi){
  somaFi = 0;

  for(i in fi){
    somaFi += fi[i];
  }
  return somaFi;
}

function varPesq(){
  
  var varPesq = [];
	  
	  //Caso seja continua, o que vai ser retornado só servirá para
	  //Colocar na tabela.
	  if(tVar == "quantContinua"){
		ic = parseInt(interClasse());
		primeiro =  parseInt(amostra[0]);

		ultimo = parseInt(amostra[amostra.length -1]);

		j = 0
		for(var i = primeiro; i < ultimo; i += ic){
		  ultIntervalo = parseInt(i) + parseInt(ic);
		  varPesq[j] = i + " - " + ultIntervalo;
		  j++;
		}
	  //Se não for continua. Os dados serão utilizados na freqSimples.
	  }else{
		  varPesq.push(amostra[0]);

		  for(var i = 1; i < amostra.length; i++){
			add = true;
			for(var j = 0; j < amostra.length; j++){
			  if(amostra[i] == varPesq[j]){
				add = false;
				break
			  }
			}
			if(add == true){
			  varPesq.push(amostra[i]);
			}
		  }
	  }
  
	return varPesq;
}

//Esta função calcula o intevalo de classe
//Com o objetivo de definir as classes no caso
//Da variável quantitativa contínua
function  interClasse() 
{

	var n = amostra.length;
	var amplitude = parseFloat(amostra[n-1]) - parseFloat(amostra[0]) + 1;
	var k = parseInt(n ** (1/2)) - 1;	
	while(amplitude % k != 0){
		amplitude++;
		if(isNaN(amplitude)) break;
	 }
	intClasse = parseInt(amplitude / k);
	return(intClasse);
}

//Utiliza os valores digitados pelo usuário e a variável
//Pesquisada para obter a frequência simples (fi).
function freqSimples(){
  var freqSimples = [];

  if(tVar== "quantContinua"){
    ic = parseInt(interClasse(amostra));
    primeiro = parseInt(amostra[0]);
	
    ultimo = parseInt(amostra[amostra.length -1]);
	
    k = 0;
	
    for(var i = primeiro; i < ultimo; i += ic){
      ultIntervalo = parseInt(i) + parseInt(ic);
      freqSimples.push(0);
      for(j = 0; j < amostra.length; j++){
        if(amostra[j] >= i && amostra[j] < ultIntervalo){
          freqSimples[k] += 1;
        }
      }
      k++;
    }
  }else{
    for(i in vPesq){
      freqSimples.push(0);
      for(j in amostra){
        if(vPesq[i] == amostra[j]){
          freqSimples[i] += 1;
        }
      }
    }
  }

  return freqSimples;
}

//Utiliza da frequencia simples para
//Obter a frequencia relativa.
function freqRel(){
  var freqTotal = somarFrequencia(freq)
  var freqRelativa = [];
  for(i = 0; i < freq.length; i++){
    freqRelativa.push((freq[i]/freqTotal) * 100);
  }

  return freqRelativa;
}

//Soma-se a frequencia afim de obter
//a quantidade total de elementos 
function somarFrequencia(fs){
  total = 0;
  for(i in fs){
    total += fs[i];
  }
  return total
}

//Função que utilizando da frequencia simples
//Obtem a frequencia acumulada
function freqAcumulada(){
  var fAcumulada = [];
  var ant = 0;
  for(i in freq){
    fAcumulada[i] = ant + freq[i];
    ant = fAcumulada[i];
  }
  return fAcumulada;
}

//Função que utilizando da frequencia relativa
//obtem a frequencia acumulada percentual.
function freqAcPercentual(){
  var fAcPercentual = [];
  var ant = 0;
  for(i in fRel){
    fAcPercentual[i] = ant + fRel[i];
    ant = fAcPercentual[i];
  }
  return fAcPercentual;
}



function definirAmostra(){
	if( procEst == "censo" ){
		return dados;
	}else{
		n = numeroAmostras();
		
		if(tecAmos == "aleatoria" ){
			return aleatoriaSimples(n);
		}else if( tecAmos == "estratificada"){
			return estratificada(n);
		}else if( tecAmos == "sistematica"){
			return sistematica(dados, n);
		}
	}

}

function estratificada(tamAmostra){
	prop = n / (dados.length + dados2.length);
	tam1 = Math.round(dados.length * prop);
	tam2 = Math.round(dados2.length * prop);

	estrato1 = sortearEstratos(tam1,dados);
	estrato2 = sortearEstratos(tam2,dados2);

	for(i = 0; i < estrato2.length; i++){
		estrato1.push(estrato2[i]);
	}
	return estrato1;
}

function sortearEstratos(tamAmostra,dados){
  var alSimples = [];
  var maximo = tamAmostra;
  var resultados = tamAmostra;

  var i;

  var p, n, tmp;
  for (p = dados.length; p;) {
      n = Math.random() * p-- | 0;
      tmp = dados[n];
      dados[n] = dados[p];
      dados[p] = tmp;
  }

  for (var i = 0; i < resultados; i++) {
      alSimples.push(dados[i]);
  }
  
  return alSimples;
}

//Função chamada caso o usuário selecione aleatória simples.
//Sorteia n elementos(tamAmostra) dos dados digitados.
function aleatoriaSimples(tamAmostra){
  var dados = pegarDados();
  var alSimples = [];
  var maximo = tamAmostra;
  var resultados = tamAmostra;

  var i;

  var p, n, tmp;
  for (p = dados.length; p;) {
      n = Math.random() * p-- | 0;
      tmp = dados[n];
      dados[n] = dados[p];
      dados[p] = tmp;
  }

  for (var i = 0; i < resultados; i++) {
      alSimples.push(dados[i]);
  }
  
  return alSimples;
}


//Função que pega os dados digitados no textarea e transforma em um vetor
//Separando os elementos que tiver virgula
function pegarDados(){
	var dados = document.getElementById("dadosInseridos").value;
	if( dados.length == 0 ){
		alert("Digite dados válidos para que seja cálculado!!!");
		return "finalizar";
	}else{
		return dados.split(",");
	}
}

//Quando o usuário clicar em uma das opções do precesso estatístico(Censo / Estimação)
//O sistema vai verificar qual deles foi clicado e a partir disso habilitar/desabilitar o campo de erro percentual.
//Retorna a opção que usuário selecionou (Censo / Estimação), que será usado em outras partes.
function habilitarErro(){
  var radios = document.getElementsByName("proc_est");

  for(i in radios){
    if(radios[i].checked){
      if(radios[i].value == "censo"){
        document.getElementById("mErro").innerHTML = "";
        document.getElementById("tec_amos").innerHTML = "Censo não tem técnica de amostragem!!!!"
      }else if(radios[i].value == "estimacao"){
        document.getElementById("mErro").innerHTML = "Margem de Erro (%):<br/><input type='number' id='erro' name='erro' min='1' max='5' step='0.1' value='3'>"
        document.getElementById("tec_amos").innerHTML ="<label>Técnica de Amostragem:<br /><input type='radio' name='tec_amos' value='aleatoria' checked='checked' onclick='habilitarEstratos()'/> Aleatória<br /><input type='radio'name='tec_amos' value='estratificada' onclick='habilitarEstratos()' /> Estratificada<br /><input type='radio'name='tec_amos' value='sistematica' onclick='habilitarEstratos()' /> Sistematica<br /></label>"
      }
      break;
    }
  }

}

function habilitarEstratos(){
  var radios = document.getElementsByName("tec_amos");

  for(i in radios){
    if(radios[i].checked){
      if(radios[i].value == "estratificada"){
        document.getElementById("localDados").innerHTML = "<textarea id='dadosInseridos'></textarea><textarea id='dadosInseridos2'></textarea><br /><br />";
      }else{
		document.getElementById("localDados").innerHTML = "<textarea id='dadosInseridos'></textarea><br /><br />";
	  }
      break;
    }
  }

}
//Função que identifica qual a técnica de amostragem
//O usuário selecionou.
function tecAmostragem(){
    var radios = document.getElementsByName("tec_amos");
    for(i in radios){
      if(radios[i].checked){
        if(radios[i].value == "aleatoria"){
          return("aleatoria");
        }else if(radios[i].value == "estratificada"){
          return("estratificada");
        }else if(radios[i].value =="sistematica"){
          return("sistematica");
        }
      }
    }

}

//Função que identifica qual processo estatístico
//Foi selecionado pelo usuário.
function procEstatistico(){
  var proc = document.getElementsByName("proc_est");
  for(i in proc){
    if(proc[i].checked){
      if(proc[i].value == "censo"){
        return "censo";
        break;
      }else if(proc[i].value == "estimacao"){
        return "estimacao";
        break;
      }
    }
  }
}

//Função que pega o valor da margem de erro - percentual
//digitado pelo usuário e retorná-o na forma decimal.
//Essa função será usada somente se a tecnica de amostragem for estimação,
//Censo não tem erro percentual.
function margemErro(){
  var erro = document.getElementById("erro").value;

  return erro/100;
}

//A partir da margem de erro e do total de elementos digitados
//A função retorna a quantidade de elementos que devem ser analisados.
//Essa função será usada somente se a tecnica de amostragem for estimação,
//Caso seja censo: todos os elementos serão analisados.
function numeroAmostras(){
	total = dados.length;
	if(tecAmos == "estratificada")
		total += dados2.length;
	erro = margemErro();
	no = 1 / (erro * erro);
	nAmostras = Math.round((total * no) / (total + no));
	
	return nAmostras;
}

//Caso o usuário selecione a técnica sistemática.
function sistematica(populacao, quantAmostra){
  sistema = parseInt(populacao.length / quantAmostra);
  amostra = [];

  inicio = Math.floor(Math.random() * sistema + 1);
  for(i = inicio; i < populacao.length; i += sistema){
    amostra.push(populacao[i]);
  }
  return amostra;
}

function pegarDados2(){
	dados2 = document.getElementById("dadosInseridos2").value;
	if( dados2.length == 0 ){
		alert("Digite dados válidos para que seja cálculado!!!");
		return("finalizar");
	}else{
		return dados2.split(",");
	}
}

function tipoVar(){
  radio = document.getElementsByName("var_pesq");
  for( i in radio){
    if(radio[i].checked){
      return radio[i].value;
      break;
    }
  }
}

//Organizando os dados. 
//Caso seja numeros vão ser organizados de forma crescente
//Se for caractere será organizado na ordem alfabética.
function organizarDados(){
	if( tVar == "quantDiscreta" || tVar == "quantContinua"){
		return amostra.sort((a,b) => a - b);
	}else{
		return amostra.sort();
	}
}

//Apenas gera a tabela no documento HTML
function gerarTabela(xi,fi,fr,fAc,fAcPerc){
    corpoTabela = document.getElementById("corpoTabela");
    corpoTabela.innerHTML = "";
    for(i in xi){
      corpoTabela = document.getElementById("corpoTabela");
      corpoTabela.innerHTML += "<tr> <td>" + xi[i] + "</td> <td>" + fi[i] + "</td><td>" + fr[i].toFixed(2) + "%</td><td>" + fAc[i] + "</td><td>" + fAcPerc[i].toFixed(2) + "%</td></tr>";
    }

}

function gerarGraficos(x,y){
	var graph = document.getElementsByClassName("grafProjeto");

	
	if(tVar == "quantContinua"){
		tipoGrafico = "bar";
	}else if(tVar == "quantDiscreta"){
		tipoGrafico = "bar";
	}else{
		tipoGrafico = "pie";
	}
	
	var chartGraph = new Chart(graph,{
			type: tipoGrafico,
			data:{
				labels:x,
				datasets:[{
					label: "Reta",
					data:y,
					borderWidth: 2,
					borderColor: "rgba(77,166,253,0.85)",
					backgroundColor: "rgba(77,166,253,0.85)",
				}],

			}
	});
}